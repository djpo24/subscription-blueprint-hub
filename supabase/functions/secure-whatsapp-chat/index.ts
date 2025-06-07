
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RateLimitCheck {
  userId: string;
  windowMinutes: number;
  maxRequests: number;
}

interface SecurityCheck {
  message: string;
  userId: string;
  userEmail: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { message, userId, userEmail }: SecurityCheck = await req.json()

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('Secure WhatsApp chat request:', { userId, userEmail, messageLength: message.length })

    // 1. Verificar autenticación
    if (!userId || !userEmail) {
      throw new Error('Usuario no autenticado')
    }

    // 2. Rate limiting avanzado
    const rateLimitChecks: RateLimitCheck[] = [
      { userId, windowMinutes: 5, maxRequests: 3 },   // 3 mensajes en 5 minutos
      { userId, windowMinutes: 60, maxRequests: 10 }, // 10 mensajes en 1 hora
      { userId, windowMinutes: 1440, maxRequests: 25 } // 25 mensajes en 24 horas
    ]

    for (const check of rateLimitChecks) {
      const windowStart = new Date(Date.now() - check.windowMinutes * 60 * 1000).toISOString()
      
      const { count, error: countError } = await supabaseClient
        .from('chat_rate_limit')
        .select('id', { count: 'exact' })
        .eq('user_id', check.userId)
        .gte('created_at', windowStart)

      if (countError) {
        console.error('Error checking rate limit:', countError)
        throw new Error('Error verificando límites de uso')
      }

      if (count && count >= check.maxRequests) {
        console.warn(`Rate limit exceeded for user ${userId}: ${count}/${check.maxRequests} in ${check.windowMinutes} minutes`)
        throw new Error('Rate limit exceeded')
      }
    }

    // 3. Verificar si el usuario está bloqueado
    const { data: userStatus, error: statusError } = await supabaseClient
      .from('user_chat_status')
      .select('is_blocked, block_reason, blocked_until')
      .eq('user_id', userId)
      .single()

    if (statusError && statusError.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('Error checking user status:', statusError)
      throw new Error('Error verificando estado del usuario')
    }

    if (userStatus?.is_blocked) {
      const blockedUntil = userStatus.blocked_until ? new Date(userStatus.blocked_until) : null
      if (!blockedUntil || blockedUntil > new Date()) {
        console.warn(`Blocked user ${userId} attempted to send message`)
        throw new Error('Blocked')
      }
    }

    // 4. Análisis de contenido del mensaje
    const suspiciousPatterns = [
      /(.)\1{10,}/g, // Caracteres repetidos más de 10 veces
      /https?:\/\/[^\s]+/gi, // URLs (opcional: bloquear enlaces)
      /[^\w\s\.,!?áéíóúñüÁÉÍÓÚÑÜ]/g // Caracteres especiales sospechosos
    ]

    let suspiciousScore = 0
    for (const pattern of suspiciousPatterns) {
      if (pattern.test(message)) {
        suspiciousScore++
      }
    }

    if (suspiciousScore >= 2) {
      console.warn(`Suspicious message detected from user ${userId}:`, message)
      
      // Registrar actividad sospechosa
      await supabaseClient
        .from('suspicious_activity')
        .insert({
          user_id: userId,
          activity_type: 'suspicious_message',
          details: { message, suspiciousScore },
          created_at: new Date().toISOString()
        })

      throw new Error('Mensaje marcado como sospechoso')
    }

    // 5. Verificar credenciales de WhatsApp
    const whatsappToken = Deno.env.get('META_WHATSAPP_TOKEN')
    const phoneNumberId = Deno.env.get('META_WHATSAPP_PHONE_NUMBER_ID')
    const adminPhone = Deno.env.get('ADMIN_WHATSAPP_NUMBER') || '+573014940399'

    if (!whatsappToken || !phoneNumberId) {
      console.error('WhatsApp credentials not configured')
      throw new Error('Servicio de WhatsApp no configurado')
    }

    // 6. Crear registro de notificación
    const { data: notificationData, error: logError } = await supabaseClient
      .from('notification_log')
      .insert({
        notification_type: 'secure_chat',
        message: `Mensaje de ${userEmail}: ${message}`,
        status: 'pending',
        metadata: {
          userId,
          userEmail,
          securityChecks: {
            rateLimitPassed: true,
            contentAnalyzed: true,
            suspiciousScore
          }
        }
      })
      .select()
      .single()

    if (logError) {
      console.error('Error creating notification log:', logError)
      throw new Error('Error registrando notificación')
    }

    // 7. Enviar mensaje a WhatsApp (al administrador)
    const whatsappPayload = {
      messaging_product: 'whatsapp',
      to: adminPhone.replace(/[\s\-\(\)\+]/g, ''),
      type: 'text',
      text: {
        body: `🔒 CHAT SEGURO\n\nDe: ${userEmail}\nUsuario: ${userId}\n\nMensaje:\n${message}\n\n⏰ ${new Date().toLocaleString('es-CO')}`
      }
    }

    console.log('Sending WhatsApp message to admin:', adminPhone)

    const whatsappResponse = await fetch(
      `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${whatsappToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(whatsappPayload)
      }
    )

    const whatsappResult = await whatsappResponse.json()
    console.log('WhatsApp API response:', whatsappResult)

    if (whatsappResponse.ok && whatsappResult.messages) {
      // Actualizar estado de la notificación
      await supabaseClient
        .from('notification_log')
        .update({ 
          status: 'sent',
          sent_at: new Date().toISOString(),
          metadata: {
            ...notificationData.metadata,
            whatsappMessageId: whatsappResult.messages[0].id
          }
        })
        .eq('id', notificationData.id)

      console.log('Secure chat message sent successfully')

      return new Response(
        JSON.stringify({ 
          success: true, 
          messageId: whatsappResult.messages[0].id,
          securityChecks: {
            rateLimitPassed: true,
            userVerified: true,
            contentAnalyzed: true,
            suspiciousScore
          }
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    } else {
      // Error de WhatsApp API
      const errorMessage = whatsappResult.error?.message || 'Error enviando mensaje WhatsApp'
      console.error('WhatsApp API error:', whatsappResult)

      await supabaseClient
        .from('notification_log')
        .update({ 
          status: 'failed',
          error_message: errorMessage
        })
        .eq('id', notificationData.id)

      throw new Error(errorMessage)
    }

  } catch (error) {
    console.error('Error in secure-whatsapp-chat:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'Error interno del servidor'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
