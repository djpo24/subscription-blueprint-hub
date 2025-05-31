
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

    console.log('Enviando notificación WhatsApp:', { notificationId, phone, message })

    // Simulate WhatsApp API call - Replace with actual WhatsApp Business API
    // For now, we'll just mark the notification as sent
    const success = true // In real implementation, this would be the result of the WhatsApp API call

    if (success) {
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
        JSON.stringify({ success: true, notificationId }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    } else {
      // Update notification status to failed
      await supabaseClient
        .from('notification_log')
        .update({ 
          status: 'failed',
          error_message: 'Error enviando mensaje WhatsApp'
        })
        .eq('id', notificationId)

      return new Response(
        JSON.stringify({ success: false, error: 'Error enviando mensaje' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      )
    }

  } catch (error) {
    console.error('Error en send-whatsapp-notification:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
