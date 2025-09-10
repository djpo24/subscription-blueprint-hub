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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const {
      notificationId,
      phone,
      message
    } = await req.json()

    console.log('📱 MANUAL MESSAGE SEND - NO AUTO FEATURES:', { 
      notificationId, 
      phone, 
      message: message?.substring(0, 50) + '...'
    });

    // Get required tokens from secrets
    const { data: accessTokenData } = await supabaseClient
      .from('app_secrets')
      .select('secret_value')
      .eq('name', 'META_WHATSAPP_TOKEN')
      .single()

    const { data: phoneIdData } = await supabaseClient
      .from('app_secrets')
      .select('secret_value')
      .eq('name', 'META_WHATSAPP_PHONE_NUMBER_ID')
      .single()

    if (!accessTokenData?.secret_value || !phoneIdData?.secret_value) {
      throw new Error('WhatsApp credentials not found')
    }

    // Format phone number
    let formattedPhone = phone.replace(/\D/g, '')
    if (!formattedPhone.startsWith('57') && !formattedPhone.startsWith('599')) {
      if (formattedPhone.length === 10) {
        formattedPhone = '57' + formattedPhone
      }
    }

    console.log('📱 Sending MANUAL message to WhatsApp Business API (NO AUTO-DETECTION)...');
    
    // Send simple text message - NO TEMPLATE AUTO-DETECTION
    const whatsappResponse = await fetch(
      `https://graph.facebook.com/v18.0/${phoneIdData.secret_value}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessTokenData.secret_value}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: formattedPhone,
          type: 'text',
          text: {
            body: message
          }
        })
      }
    )

    const whatsappResult = await whatsappResponse.json()
    console.log('📱 WhatsApp API response:', { 
      status: whatsappResponse.status, 
      result: whatsappResult 
    });

    if (!whatsappResponse.ok || whatsappResult.error) {
      console.error('❌ WhatsApp API error:', whatsappResult)
      
      // Update notification log with error
      await supabaseClient
        .from('notification_log')
        .update({ 
          status: 'failed',
          error_message: whatsappResult.error?.message || 'WhatsApp API error'
        })
        .eq('id', notificationId)

      return new Response(
        JSON.stringify({ 
          success: false, 
          error: whatsappResult.error?.message || 'WhatsApp API error',
          details: whatsappResult 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      )
    }

    // Update notification log with success
    await supabaseClient
      .from('notification_log')
      .update({ 
        status: 'sent',
        whatsapp_message_id: whatsappResult.messages?.[0]?.id || null
      })
      .eq('id', notificationId)

    return new Response(
      JSON.stringify({ 
        success: true,
        messageType: 'text',
        whatsappMessageId: whatsappResult.messages?.[0]?.id,
        formattedPhone: formattedPhone,
        message: 'Manual message sent successfully - NO AUTO FEATURES'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('❌ Error in send-manual-message:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})