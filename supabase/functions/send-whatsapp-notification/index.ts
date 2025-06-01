
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { notificationId, phone, message } = await req.json()

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get WhatsApp API credentials from secrets
    const whatsappToken = Deno.env.get('META_WHATSAPP_TOKEN')
    const phoneNumberId = Deno.env.get('META_WHATSAPP_PHONE_NUMBER_ID')

    if (!whatsappToken || !phoneNumberId) {
      console.error('Missing WhatsApp API credentials')
      throw new Error('WhatsApp API credentials not configured')
    }

    console.log('Enviando notificación WhatsApp:', { notificationId, phone, message })

    // Clean phone number (remove spaces, dashes, etc.)
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '')
    
    // Ensure phone number starts with country code (assume +57 for Colombia if not present)
    let formattedPhone = cleanPhone
    if (!formattedPhone.startsWith('+')) {
      if (formattedPhone.startsWith('57')) {
        formattedPhone = '+' + formattedPhone
      } else if (formattedPhone.startsWith('3')) {
        formattedPhone = '+57' + formattedPhone
      } else {
        formattedPhone = '+57' + formattedPhone
      }
    }

    // Remove the '+' for the API call
    const apiPhone = formattedPhone.replace('+', '')

    console.log('Teléfono formateado:', { original: phone, formatted: apiPhone })

    // Prepare WhatsApp message payload
    const whatsappPayload = {
      messaging_product: 'whatsapp',
      to: apiPhone,
      type: 'text',
      text: {
        body: message
      }
    }

    console.log('Payload para WhatsApp API:', whatsappPayload)

    // Send message via WhatsApp Business API
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
    console.log('Respuesta de WhatsApp API:', whatsappResult)

    if (whatsappResponse.ok && whatsappResult.messages) {
      // Update notification status to sent
      const { error: updateError } = await supabaseClient
        .from('notification_log')
        .update({ 
          status: 'sent',
          sent_at: new Date().toISOString()
        })
        .eq('id', notificationId)

      if (updateError) {
        console.error('Error updating notification status:', updateError)
        throw updateError
      }

      console.log('Notificación enviada exitosamente:', notificationId)

      return new Response(
        JSON.stringify({ 
          success: true, 
          notificationId,
          whatsappMessageId: whatsappResult.messages[0].id 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    } else {
      // Handle WhatsApp API error
      const errorMessage = whatsappResult.error?.message || 'Error enviando mensaje WhatsApp'
      console.error('Error de WhatsApp API:', whatsappResult)

      // Update notification status to failed
      await supabaseClient
        .from('notification_log')
        .update({ 
          status: 'failed',
          error_message: errorMessage
        })
        .eq('id', notificationId)

      return new Response(
        JSON.stringify({ 
          success: false, 
          error: errorMessage,
          details: whatsappResult 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      )
    }

  } catch (error) {
    console.error('Error en send-whatsapp-notification:', error)
    
    // Try to update notification status to failed if we have the ID
    if (notificationId) {
      try {
        const supabaseClient = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )
        await supabaseClient
          .from('notification_log')
          .update({ 
            status: 'failed',
            error_message: error.message
          })
          .eq('id', notificationId)
      } catch (updateError) {
        console.error('Error updating failed notification:', updateError)
      }
    }

    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
