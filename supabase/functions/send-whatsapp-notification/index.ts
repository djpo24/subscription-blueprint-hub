import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Helper function to clean and format phone numbers correctly
function cleanAndFormatPhoneNumber(phone: string): string {
  console.log('📞 Original phone number:', phone);
  
  // Remove all non-digit characters except the + at the beginning
  let cleaned = phone.replace(/[^\d+]/g, '');
  
  // If it starts with +, keep it, otherwise remove any + characters
  if (cleaned.startsWith('+')) {
    // Keep the first + and remove any others
    cleaned = '+' + cleaned.substring(1).replace(/\+/g, '');
  } else {
    // Remove all + characters
    cleaned = cleaned.replace(/\+/g, '');
  }
  
  console.log('📞 After cleaning:', cleaned);
  
  // If it already has a country code (starts with + or is longer than 10 digits)
  if (cleaned.startsWith('+')) {
    console.log('📞 Already has country code');
    return cleaned;
  }
  
  // If it's a long number without +, it might already include country code
  if (cleaned.length > 10) {
    // Check if it starts with known country codes
    if (cleaned.startsWith('599') || cleaned.startsWith('5997') || cleaned.startsWith('57') || cleaned.startsWith('52') || cleaned.startsWith('1') || cleaned.startsWith('501')) {
      console.log('📞 Adding + to existing country code');
      return '+' + cleaned;
    }
  }
  
  // Colombian mobile numbers (start with 3)
  if (cleaned.startsWith('3') && cleaned.length === 10) {
    console.log('📞 Adding Colombia country code');
    return '+57' + cleaned;
  }
  
  // If it's exactly 10 digits and starts with other digits, assume Colombia
  if (cleaned.length === 10) {
    console.log('📞 Adding Colombia country code to 10-digit number');
    return '+57' + cleaned;
  }
  
  // For shorter numbers, assume Colombia
  if (cleaned.length < 10) {
    console.log('📞 Adding Colombia country code to short number');
    return '+57' + cleaned;
  }
  
  // Default case - add Colombia code
  console.log('📞 Default: Adding Colombia country code');
  return '+57' + cleaned;
}

// Helper function to get API-ready phone number (without +)
function getApiReadyPhoneNumber(formattedPhone: string): string {
  return formattedPhone.replace(/^\+/, '');
}

// Helper function to log detailed WhatsApp errors
async function logWhatsAppError(supabaseClient: any, notificationId: string, errorData: any, phone: string, context: string) {
  console.log(`🚨 [${context}] Logging WhatsApp error for phone ${phone}:`, errorData);
  
  const errorDetails = {
    context: context,
    phone: phone,
    error_code: errorData?.error?.code || errorData?.code || 'UNKNOWN',
    error_message: errorData?.error?.message || errorData?.message || 'Unknown error',
    error_type: errorData?.error?.type || errorData?.type || 'api_error',
    error_subcode: errorData?.error?.error_subcode || errorData?.error_subcode || null,
    error_user_title: errorData?.error?.error_user_title || null,
    error_user_msg: errorData?.error?.error_user_msg || null,
    fbtrace_id: errorData?.error?.fbtrace_id || null,
    full_error_data: errorData,
    timestamp: new Date().toISOString()
  };

  try {
    // Determine which table to update based on notification type
    // First check if it's a trip notification log
    const { data: tripLogData } = await supabaseClient
      .from('trip_notification_log')
      .select('id')
      .eq('id', notificationId)
      .single();

    if (tripLogData) {
      // Update trip notification log
      await supabaseClient
        .from('trip_notification_log')
        .update({ 
          status: 'failed',
          error_message: `[${context}] ${errorDetails.error_message} (Code: ${errorDetails.error_code})`
        })
        .eq('id', notificationId);
    } else {
      // Update regular notification log
      await supabaseClient
        .from('notification_log')
        .update({ 
          status: 'failed',
          error_message: `[${context}] ${errorDetails.error_message} (Code: ${errorDetails.error_code})`
        })
        .eq('id', notificationId);
    }

    // Log to console for immediate debugging
    console.error(`🚨 [${context}] WhatsApp Error Details:`, {
      phone: phone,
      code: errorDetails.error_code,
      message: errorDetails.error_message,
      type: errorDetails.error_type,
      subcode: errorDetails.error_subcode,
      fbtrace_id: errorDetails.fbtrace_id
    });

    // Additional logging for specific error types
    if (errorDetails.error_code === 131047) {
      console.error('🚨 24-hour window violation detected for phone:', phone);
    } else if (errorDetails.error_code === 131056) {
      console.error('🚨 Phone number not registered on WhatsApp:', phone);
    } else if (errorDetails.error_code === 100) {
      console.error('🚨 Invalid phone number format or missing parameter:', phone);
    } else if (errorDetails.error_code === 190) {
      console.error('🚨 Access token expired or invalid');
    } else if (errorDetails.error_code === 133016) {
      console.error('🚨 Rate limit exceeded');
    }

  } catch (logError) {
    console.error('❌ Failed to log WhatsApp error to database:', logError);
  }
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
      templateParameters,
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

    // Clean and format phone number properly
    const formattedPhone = cleanAndFormatPhoneNumber(phone);
    const apiPhone = getApiReadyPhoneNumber(formattedPhone);

    console.log('📞 Phone formatting completed:', { 
      original: phone, 
      formatted: formattedPhone,
      apiReady: apiPhone 
    });

    // AUTO-DETECT: Check if we need to use a template
    let shouldUseTemplate = useTemplate
    let autoSelectedTemplate = templateName
    let autoSelectedLanguage = templateLanguage || 'es_CO'

    if (!useTemplate && customerId) {
      // Check when was the last inbound message from this customer
      const { data: lastMessage, error: lastMessageError } = await supabaseClient
        .from('whatsapp_messages')
        .select('sent_at')
        .eq('customer_id', customerId)
        .eq('direction', 'inbound')
        .order('sent_at', { ascending: false })
        .limit(1)

      if (!lastMessageError && lastMessage && lastMessage.length > 0) {
        const lastInteraction = new Date(lastMessage[0].sent_at)
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
      console.log('📋 Using WhatsApp template:', autoSelectedTemplate, 'with language:', autoSelectedLanguage);
      console.log('📋 Template parameters received:', templateParameters);
      
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
      } else if (autoSelectedTemplate === 'proximos_viajes') {
        console.log('🚀 CONFIGURANDO PLANTILLA PROXIMOS_VIAJES');
        console.log('📋 TemplateParameters recibidos:', JSON.stringify(templateParameters, null, 2));
        
        if (templateParameters) {
          const customerName = templateParameters.customerName || 'Cliente'
          
          // Helper function to format dates in Spanish
          const formatDateToSpanish = (dateString) => {
            if (!dateString) return 'fecha no disponible';
            
            const date = new Date(dateString + 'T00:00:00');
            const days = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
            const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
            
            const dayName = days[date.getDay()];
            const dayNumber = date.getDate();
            const monthName = months[date.getMonth()];
            
            return `${dayName} ${dayNumber} de ${monthName}`;
          };

          // Format dates according to Facebook template
          const outboundDateText = formatDateToSpanish(templateParameters.outboundDate);
          const returnDateText = formatDateToSpanish(templateParameters.returnDate);
          const deadlineDateText = formatDateToSpanish(templateParameters.deadlineDate);

          console.log('📋 Fechas formateadas para WhatsApp:', {
            customerName,
            outboundDateText,
            returnDateText,
            deadlineDateText
          });

          // CONFIGURACIÓN CORREGIDA: Solo Body con 4 parámetros (nombre + 3 fechas)
          templatePayload.template.components = [
            {
              type: 'body',
              parameters: [
                { type: 'text', text: customerName },        // {{1}} - nombre del cliente
                { type: 'text', text: outboundDateText },    // {{2}} - fecha salida completa
                { type: 'text', text: returnDateText },      // {{3}} - fecha retorno completa
                { type: 'text', text: deadlineDateText }     // {{4}} - fecha límite completa
              ]
            }
          ]

          console.log('✅ CONFIGURACIÓN CORREGIDA - Solo Body con 4 parámetros')
          console.log('🔍 Template components final:', JSON.stringify(templatePayload.template.components, null, 2))
        } else {
          console.error('❌ CRÍTICO: No se recibieron templateParameters para proximos_viajes');
          throw new Error('templateParameters requeridos para plantilla proximos_viajes');
        }
      } else if (autoSelectedTemplate === 'redimir' && templateParameters) {
        console.log('🎁 Configurando plantilla REDIMIR');
        console.log('📋 Verification code:', templateParameters.verificationCode);
        
        const verificationCode = templateParameters.verificationCode || '0000';
        
        templatePayload.template.components = [
          {
            type: 'body',
            parameters: [
              { type: 'text', text: verificationCode }
            ]
          },
          {
            type: 'button',
            sub_type: 'url',
            index: '0',
            parameters: [
              { type: 'text', text: verificationCode }
            ]
          }
        ];
        
        console.log('✅ Template REDIMIR configurado con código en body y button:', verificationCode);
      } else if (autoSelectedTemplate === 'canjea' && templateParameters) {
        console.log('🎁 CONFIGURANDO PLANTILLA CANJEA (Fidelización - Canjeable)');
        console.log('📋 TemplateParameters recibidos:', JSON.stringify(templateParameters, null, 2));
        
        // CRÍTICO: Convertir a strings y asegurar que no estén vacíos
        const customerName = String(templateParameters.customerName || 'Cliente').trim();
        const pointsAvailable = String(templateParameters.pointsAvailable || '0').trim();
        const kilosAvailable = String(templateParameters.kilosAvailable || '0').trim();

        // Validar que ningún parámetro esté vacío
        if (!customerName || !pointsAvailable || !kilosAvailable) {
          console.error('❌ CRÍTICO: Parámetros vacíos detectados:', { customerName, pointsAvailable, kilosAvailable });
          throw new Error('Parámetros de template incompletos');
        }

        console.log('📋 Parámetros validados:', {
          customerName,
          pointsAvailable,
          kilosAvailable
        });

        // CONFIGURACIÓN: Solo Body con 3 parámetros
        templatePayload.template.components = [
          {
            type: 'body',
            parameters: [
              { type: 'text', text: customerName },
              { type: 'text', text: pointsAvailable },
              { type: 'text', text: kilosAvailable }
            ]
          }
        ];

        console.log('✅ PLANTILLA CANJEA configurada - Body con 3 parámetros');
        console.log('🔍 Template payload completo:', JSON.stringify(templatePayload, null, 2));
      } else if (autoSelectedTemplate === 'pendiente_canje' && templateParameters) {
        console.log('📈 CONFIGURANDO PLANTILLA PENDIENTE_CANJE (Fidelización - Motivacional)');
        console.log('📋 TemplateParameters recibidos:', JSON.stringify(templateParameters, null, 2));
        
        // CRÍTICO: Convertir a strings y asegurar que no estén vacíos
        const customerName = String(templateParameters.customerName || 'Cliente').trim();
        const pointsAvailable = String(templateParameters.pointsAvailable || '0').trim();
        const pointsMissing = String(templateParameters.pointsMissing || '0').trim();

        // Validar que ningún parámetro esté vacío
        if (!customerName || !pointsAvailable || !pointsMissing) {
          console.error('❌ CRÍTICO: Parámetros vacíos detectados:', { customerName, pointsAvailable, pointsMissing });
          throw new Error('Parámetros de template incompletos');
        }

        console.log('📋 Parámetros validados:', {
          customerName,
          pointsAvailable,
          pointsMissing
        });

        // CONFIGURACIÓN: Solo Body con 3 parámetros usando índice explícito
        templatePayload.template.components = [
          {
            type: 'body',
            parameters: [
              { type: 'text', text: customerName },
              { type: 'text', text: pointsAvailable },
              { type: 'text', text: pointsMissing }
            ]
          }
        ];

        console.log('✅ PLANTILLA PENDIENTE_CANJE configurada - Body con 3 parámetros');
        console.log('🔍 Template payload completo:', JSON.stringify(templatePayload, null, 2));
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
      console.log('📤 PAYLOAD FINAL para WhatsApp:', JSON.stringify(whatsappPayload, null, 2));
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

    // Send message via WhatsApp Business API
    console.log('🚀 Enviando a WhatsApp Business API...');
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
    console.log('📱 WhatsApp API response completa:', { 
      status: whatsappResponse.status, 
      ok: whatsappResponse.ok,
      statusText: whatsappResponse.statusText,
      headers: Object.fromEntries(whatsappResponse.headers.entries()),
      result: JSON.stringify(whatsappResult, null, 2)
    })

    if (whatsappResponse.ok && whatsappResult.messages) {
      // CAMBIO CRÍTICO: Solo usar notification_log (igual que llegadas)
      const { error: updateError } = await supabaseClient
        .from('notification_log')
        .update({
          status: 'sent',
          sent_at: new Date().toISOString()
        })
        .eq('id', notificationId);

      if (updateError) {
        console.error('❌ Error updating notification status:', updateError);
      }

      // Persistir mensaje en el esquema unificado del chat
      try {
        const wabaId = whatsappResult.messages[0].id;
        const { data: conv } = await supabaseClient
          .from('whatsapp_conversations')
          .upsert(
            {
              phone_number: apiPhone,
              customer_id: customerId ?? null,
              status: 'open',
              last_message_at: new Date().toISOString(),
            },
            { onConflict: 'phone_number' },
          )
          .select('id')
          .single();

        const isImage = !shouldUseTemplate && !!imageUrl;
        const msgType = shouldUseTemplate
          ? 'text'  // las plantillas se renderizan como texto en el chat
          : (isImage ? 'image' : 'text');

        const baseContent = shouldUseTemplate
          ? (templateParameters?.message ?? message ?? `[Plantilla: ${autoSelectedTemplate}]`)
          : (message ?? '');

        await supabaseClient.from('whatsapp_messages').insert({
          conversation_id: conv?.id ?? null,
          customer_id: customerId ?? null,
          direction: 'outbound',
          message_type: msgType,
          content: baseContent || null,
          waba_message_id: wabaId,
          status: 'sent',
          sent_at: new Date().toISOString(),
          media_url: isImage ? imageUrl : null,
          media_mime_type: isImage ? 'image/jpeg' : null,
          media_caption: isImage ? (message || null) : null,
        });
      } catch (persistErr) {
        console.error('⚠ Failed to persist outbound to whatsapp_messages:', persistErr);
      }

      console.log('✅ WhatsApp message sent successfully to:', apiPhone)

      return new Response(
        JSON.stringify({ 
          success: true, 
          notificationId,
          whatsappMessageId: whatsappResult.messages[0].id,
          messageType: shouldUseTemplate ? 'template' : (imageUrl ? 'image' : 'text'),
          templateUsed: shouldUseTemplate ? autoSelectedTemplate : null,
          autoDetected: shouldUseTemplate && !useTemplate,
          formattedPhone: formattedPhone
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    } else {
      // Handle WhatsApp API error with detailed logging
      console.error('❌ WhatsApp API ERROR COMPLETO:', {
        status: whatsappResponse.status,
        statusText: whatsappResponse.statusText,
        phone: apiPhone,
        template: autoSelectedTemplate,
        responseBody: JSON.stringify(whatsappResult, null, 2)
      });
      
      // Log detailed error information
      await logWhatsAppError(supabaseClient, notificationId, whatsappResult, formattedPhone, 'TEMPLATE_ERROR');

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
          console.log('🔄 Template retry response for phone:', apiPhone, {
            status: retryResponse.status, 
            ok: retryResponse.ok,
            result: retryResult
          })

          if (retryResponse.ok && retryResult.messages) {
            // Determine which table to update for retry
            const { data: tripLogData } = await supabaseClient
              .from('trip_notification_log')
              .select('id')
              .eq('id', notificationId)
              .single();

            if (tripLogData) {
              await supabaseClient
                .from('trip_notification_log')
                .update({ 
                  status: 'sent',
                  sent_at: new Date().toISOString(),
                  whatsapp_message_id: retryResult.messages[0].id
                })
                .eq('id', notificationId);
            } else {
              await supabaseClient
                .from('notification_log')
                .update({ 
                  status: 'sent',
                  sent_at: new Date().toISOString()
                })
                .eq('id', notificationId);
            }

            return new Response(
              JSON.stringify({ 
                success: true, 
                notificationId,
                whatsappMessageId: retryResult.messages[0].id,
                messageType: 'template',
                templateUsed: 'customer_service_followup',
                autoDetected: true,
                retried: true,
                formattedPhone: formattedPhone
              }),
              { 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200 
              }
            )
          } else {
            // Log retry error too
            await logWhatsAppError(supabaseClient, notificationId, retryResult, formattedPhone, 'TEMPLATE_RETRY');
          }
        }
      }

      // Return error response with detailed information
      const errorMessage = whatsappResult.error?.message || 'Error enviando mensaje WhatsApp'
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: errorMessage,
          error_code: whatsappResult.error?.code || 'UNKNOWN',
          error_type: whatsappResult.error?.type || 'api_error',
          details: whatsappResult,
          suggestTemplate: whatsappResult.error?.code === 131047,
          formattedPhone: formattedPhone,
          debug: {
            templateUsed: autoSelectedTemplate,
            templateParameters: templateParameters,
            payload: whatsappPayload
          }
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
      JSON.stringify({ 
        error: error.message,
        stack: error.stack
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
