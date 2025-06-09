
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

    console.log('Enviando notificación WhatsApp:', { 
      notificationId, 
      phone, 
      message, 
      imageUrl,
      useTemplate, 
      templateName, 
      templateLanguage,
      templateParameters,
      customerId
    })

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

    // AUTO-DETECT: Check if we need to use a template
    let shouldUseTemplate = useTemplate
    let autoSelectedTemplate = templateName
    let autoSelectedLanguage = templateLanguage || 'es'

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

        console.log('Última interacción hace:', hoursSinceLastInteraction, 'horas')

        // If more than 24 hours, we need to use a template
        if (hoursSinceLastInteraction > 24) {
          shouldUseTemplate = true
          autoSelectedTemplate = 'customer_service_followup'
          console.log('🔄 Auto-seleccionando plantilla por regla de 24 horas')
        }
      } else {
        // No previous interaction found, use template for first contact
        shouldUseTemplate = true
        autoSelectedTemplate = 'customer_service_hello'
        console.log('🔄 Auto-seleccionando plantilla para primer contacto')
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
        // Obtener dirección del destino si no se proporcionó
        let address = templateParameters.address || 'nuestras oficinas'
        
        if (!templateParameters.address && templateParameters.destination) {
          const { data: destinationAddress } = await supabaseClient
            .from('destination_addresses')
            .select('address')
            .ilike('city', templateParameters.destination)
            .limit(1)
            .single()
          
          if (destinationAddress) {
            address = destinationAddress.address
          }
        }

        // Usar el formato exacto especificado:
        // 📦 Hola {{1}}, tu encomienda {{2}} ha llegado a 📍{{3}}.
        // 🏢 Ya puedes recogerla en la dirección: {{4}}.
        // 💰 Te recordamos el valor a pagar: {{5}}{{6}}.
        // 🙏 ¡Gracias por confiar en nosotros!
        templatePayload.template.components = [
          {
            type: 'body',
            parameters: [
              { type: 'text', text: templateParameters.customerName }, // {{1}} - nombre cliente
              { type: 'text', text: templateParameters.trackingNumber }, // {{2}} - tracking
              { type: 'text', text: templateParameters.destination }, // {{3}} - destino
              { type: 'text', text: address }, // {{4}} - dirección
              { type: 'text', text: templateParameters.currency }, // {{5}} - símbolo moneda
              { type: 'text', text: templateParameters.amount } // {{6}} - monto
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
      console.log('Usando plantilla de WhatsApp:', autoSelectedTemplate)
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
      console.log('Enviando imagen con WhatsApp:', imageUrl)
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
      console.log('Usando mensaje de texto regular')
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
      console.error('Error de WhatsApp API:', whatsappResult)

      // Check if it's a 24-hour window error
      if (whatsappResult.error?.code === 131047 || 
          (whatsappResult.error?.error_data?.details && 
           whatsappResult.error.error_data.details.includes('24 hours'))) {
        
        console.log('🔄 Error de ventana de 24 horas detectado, reintentando con plantilla...')
        
        // Retry with template if we haven't already
        if (!shouldUseTemplate) {
          const retryPayload = {
            messaging_product: 'whatsapp',
            to: apiPhone,
            type: 'template',
            template: {
              name: 'customer_service_followup',
              language: {
                code: 'es'
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
          console.log('Respuesta del reintento con plantilla:', retryResult)

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
