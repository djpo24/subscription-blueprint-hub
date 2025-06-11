
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
    const { 
      notificationId, 
      phone, 
      message, 
      imageUrl, 
      useTemplate = false, 
      templateName, 
      templateLanguage, 
      templateParameters,
      customerId 
    } = await req.json()

    console.log('📱 Starting WhatsApp notification send...', { 
      notificationId, 
      phone, 
      message: message?.substring(0, 50) + '...', 
      useTemplate,
      templateName,
      customerId
    });

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get WhatsApp API credentials from app_secrets table
    console.log('🔑 Retrieving WhatsApp credentials from app_secrets...');
    
    let whatsappToken, phoneNumberId;

    try {
      const { data: tokenData } = await supabaseClient.rpc('get_app_secret', { secret_name: 'META_WHATSAPP_TOKEN' });
      const { data: phoneData } = await supabaseClient.rpc('get_app_secret', { secret_name: 'META_WHATSAPP_PHONE_NUMBER_ID' });

      whatsappToken = tokenData;
      phoneNumberId = phoneData;

      console.log('🔑 Credentials retrieved:', {
        tokenExists: !!whatsappToken,
        phoneIdExists: !!phoneNumberId
      });
    } catch (error) {
      console.error('❌ Error retrieving credentials from app_secrets:', error);
      
      // Fallback to environment variables
      whatsappToken = Deno.env.get('META_WHATSAPP_TOKEN');
      phoneNumberId = Deno.env.get('META_WHATSAPP_PHONE_NUMBER_ID');
      
      console.log('🔄 Using fallback environment variables:', {
        tokenExists: !!whatsappToken,
        phoneIdExists: !!phoneNumberId
      });
    }

    if (!whatsappToken || !phoneNumberId) {
      console.error('❌ Missing WhatsApp API credentials');
      throw new Error('WhatsApp API credentials not configured')
    }

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

    console.log('📞 Phone formatting:', { original: phone, formatted: apiPhone })

    // AUTO-DETECT: Check if we need to use a template
    let shouldUseTemplate = useTemplate
    let autoSelectedTemplate = templateName
    let autoSelectedLanguage = templateLanguage || 'es_CO'

    if (!useTemplate && customerId) {
      // Check when was the last interaction with this customer
      const { data: lastMessage, error: lastMessageError } = await supabaseClient
        .from('incoming_messages')
        .select('timestamp')
        .eq('customer_id', customerId)
        .order('timestamp', { ascending: false })
        .limit(1)

      if (!lastMessageError && lastMessage && lastMessage.length > 0) {
        const lastInteraction = new Date(lastMessage[0].timestamp)
        const now = new Date()
        const hoursSinceLastInteraction = (now.getTime() - lastInteraction.getTime()) / (1000 * 60 * 60)

        console.log('⏰ Last interaction was:', hoursSinceLastInteraction, 'hours ago')

        // If more than 24 hours, we need to use a template
        if (hoursSinceLastInteraction > 24) {
          shouldUseTemplate = true
          autoSelectedTemplate = 'customer_service_followup'
          autoSelectedLanguage = 'es_CO'
          console.log('🔄 Auto-selecting template due to 24-hour rule')
        }
      } else {
        // No previous interaction found, use template for first contact
        shouldUseTemplate = true
        autoSelectedTemplate = 'customer_service_hello'
        autoSelectedLanguage = 'es_CO'
        console.log('🔄 Auto-selecting template for first contact')
      }
    }

    // Prepare WhatsApp message payload
    let whatsappPayload

    if (shouldUseTemplate && autoSelectedTemplate) {
      // Use template message
      const templatePayload = {
        messaging_product: 'whatsapp',
        to: apiPhone,
        type: 'template',
        template: {
          name: autoSelectedTemplate,
          language: {
            code: autoSelectedLanguage
          }
        }
      }

      // Add parameters for specific templates
      if (autoSelectedTemplate === 'package_arrival_notification' && templateParameters) {
        // VALIDACIÓN CRÍTICA: Verificar que la dirección NO sea genérica
        const address = templateParameters.address
        
        if (!address) {
          console.error('❌ CRÍTICO: No se proporcionó dirección en templateParameters')
          throw new Error('Dirección requerida para template de llegada')
        }
        
        if (address.toLowerCase().includes('nuestras oficinas')) {
          console.error(`❌ CRÍTICO: Dirección genérica detectada en WhatsApp: "${address}"`)
          throw new Error('No se puede enviar notificación con dirección genérica')
        }

        console.log('📍 VALIDACIÓN EXITOSA - Dirección específica confirmada:', address)
        console.log('📋 Template parameters recibidos:', templateParameters)

        const customerName = templateParameters.customerName || 'Cliente'
        const trackingNumber = templateParameters.trackingNumber || 'N/A'
        const destination = templateParameters.destination || 'destino'
        const currency = templateParameters.currency || '$'
        const amount = templateParameters.amount || '0'

        templatePayload.template.components = [
          {
            type: 'body',
            parameters: [
              { type: 'text', text: customerName },
              { type: 'text', text: trackingNumber },
              { type: 'text', text: destination },
              { type: 'text', text: address }, // Dirección ya validada
              { type: 'text', text: currency },
              { type: 'text', text: amount }
            ]
          }
        ]

        console.log('✅ Package arrival template configurado con dirección específica:', address)
      } else if (autoSelectedTemplate === 'consulta_encomienda' && templateParameters) {
        const customerName = templateParameters.customerName || 'Cliente'
        templatePayload.template.components = [
          {
            type: 'body',
            parameters: [
              { type: 'text', text: customerName }
            ]
          }
        ]
      } else if (autoSelectedTemplate === 'customer_service_followup') {
        templatePayload.template.components = [
          {
            type: 'body',
            parameters: [
              {
                type: 'text',
                text: message || 'su consulta'
              }
            ]
          }
        ]
      }

      whatsappPayload = templatePayload
      console.log('📋 Using WhatsApp template:', autoSelectedTemplate)
    } else if (imageUrl) {
      // Send image with optional text caption
      whatsappPayload = {
        messaging_product: 'whatsapp',
        to: apiPhone,
        type: 'image',
        image: {
          link: imageUrl,
          caption: message || ''
        }
      }
      console.log('🖼️ Sending image message')
    } else {
      // Use regular text message
      whatsappPayload = {
        messaging_product: 'whatsapp',
        to: apiPhone,
        type: 'text',
        text: {
          body: message
        }
      }
      console.log('💬 Sending text message')
    }

    console.log('📤 Final WhatsApp payload prepared')

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
    console.log('📱 WhatsApp API response:', { 
      status: whatsappResponse.status, 
      ok: whatsappResponse.ok,
      hasMessages: !!whatsappResult.messages 
    })

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
        console.error('❌ Error updating notification status:', updateError)
      }

      console.log('✅ WhatsApp message sent successfully')

      return new Response(
        JSON.stringify({ 
          success: true, 
          notificationId,
          whatsappMessageId: whatsappResult.messages[0].id,
          messageType: shouldUseTemplate ? 'template' : (imageUrl ? 'image' : 'text'),
          templateUsed: shouldUseTemplate ? autoSelectedTemplate : null,
          autoDetected: shouldUseTemplate && !useTemplate
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    } else {
      // Handle WhatsApp API error
      const errorMessage = whatsappResult.error?.message || 'Error enviando mensaje WhatsApp'
      console.error('❌ WhatsApp API error:', whatsappResult)

      // Check if it's a 24-hour window error
      if (whatsappResult.error?.code === 131047 || 
          (whatsappResult.error?.error_data?.details && 
           whatsappResult.error.error_data.details.includes('24 hours'))) {
        
        console.log('🔄 24-hour window error detected, retrying with template...')
        
        // Retry with template if we haven't already
        if (!shouldUseTemplate) {
          const retryPayload = {
            messaging_product: 'whatsapp',
            to: apiPhone,
            type: 'template',
            template: {
              name: 'customer_service_followup',
              language: {
                code: 'es_CO'
              },
              components: [
                {
                  type: 'body',
                  parameters: [
                    {
                      type: 'text',
                      text: message || 'su consulta'
                    }
                  ]
                }
              ]
            }
          }

          const retryResponse = await fetch(
            `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${whatsappToken}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(retryPayload)
            }
          )

          const retryResult = await retryResponse.json()
          console.log('🔄 Template retry response:', retryResponse.status, retryResponse.ok)

          if (retryResponse.ok && retryResult.messages) {
            await supabaseClient
              .from('notification_log')
              .update({ 
                status: 'sent',
                sent_at: new Date().toISOString()
              })
              .eq('id', notificationId)

            return new Response(
              JSON.stringify({ 
                success: true, 
                notificationId,
                whatsappMessageId: retryResult.messages[0].id,
                messageType: 'template',
                templateUsed: 'customer_service_followup',
                autoDetected: true,
                retried: true
              }),
              { 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200 
              }
            )
          }
        }
      }

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
          details: whatsappResult,
          suggestTemplate: whatsappResult.error?.code === 131047
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      )
    }

  } catch (error) {
    console.error('❌ Error in send-whatsapp-notification:', error)
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
