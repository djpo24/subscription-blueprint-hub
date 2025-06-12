import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  if (req.method === 'GET') {
    const url = new URL(req.url);
    const mode = url.searchParams.get('hub.mode');
    const token = url.searchParams.get('hub.verify_token');
    const challenge = url.searchParams.get('hub.challenge');
    
    const expectedToken = Deno.env.get('META_WHATSAPP_VERIFY_TOKEN');
    
    if (mode === 'subscribe' && token === expectedToken) {
      console.log('Webhook verified V3');
      return new Response(challenge, {
        status: 200,
        headers: { 'Content-Type': 'text/plain' },
      });
    } else {
      console.log('Webhook verification failed V3');
      return new Response('Verification failed', { status: 403 });
    }
  }

  if (req.method === 'POST') {
    try {
      const body = await req.json();
      console.log(`🔄 Webhook V3 request received:`, {
        method: req.method,
        url: req.url,
        headers: Object.fromEntries(req.headers.entries())
      });
      console.log(`📨 Webhook V3 received POST:`, JSON.stringify(body, null, 2));

      const supabaseUrl = Deno.env.get('SUPABASE_URL');
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
      const supabase = createClient(supabaseUrl!, supabaseKey!);

      if (body.object === 'whatsapp_business_account') {
        for (const entry of body.entry) {
          for (const change of entry.changes) {
            if (change.field === 'messages') {
              console.log(`Processing messages change V3:`, JSON.stringify(change.value, null, 2));

              // Procesar actualizaciones de estado de mensajes
              if (change.value.statuses) {
                for (const status of change.value.statuses) {
                  console.log(`Message status update V3:`, {
                    id: status.id,
                    status: status.status,
                    timestamp: status.timestamp,
                    recipient_id: status.recipient_id
                  });

                  // Registrar estado de entrega
                  try {
                    const { error: deliveryError } = await supabase
                      .from('message_delivery_status')
                      .upsert({
                        whatsapp_message_id: status.id,
                        phone_number: status.recipient_id,
                        status: status.status,
                        timestamp: new Date(parseInt(status.timestamp) * 1000).toISOString(),
                        raw_data: status
                      }, {
                        onConflict: 'whatsapp_message_id'
                      });

                    if (deliveryError) {
                      console.error(`Error logging delivery status V3:`, deliveryError);
                    } else {
                      console.log(`Delivery status logged for notification V3:`, status.id);
                    }
                  } catch (error) {
                    console.error(`Error processing delivery status V3:`, error);
                  }
                }
              }

              // Procesar mensajes entrantes
              if (change.value.messages) {
                for (const message of change.value.messages) {
                  // Extraer información del mensaje
                  let messageContent = '';
                  let messageType = 'text';
                  let mediaUrl = null;

                  if (message.text) {
                    messageContent = message.text.body;
                    messageType = 'text';
                  } else if (message.image) {
                    messageType = 'image';
                    mediaUrl = message.image.id;
                    messageContent = message.image.caption || 'Imagen recibida';
                  } else if (message.document) {
                    messageType = 'document';
                    mediaUrl = message.document.id;
                    messageContent = message.document.filename || 'Documento recibido';
                  } else if (message.audio) {
                    messageType = 'audio';
                    mediaUrl = message.audio.id;
                    messageContent = 'Audio recibido';
                  } else if (message.video) {
                    messageType = 'video';
                    mediaUrl = message.video.id;
                    messageContent = message.video.caption || 'Video recibido';
                  }

                  const fromPhone = message.from;
                  const timestamp = new Date(parseInt(message.timestamp) * 1000).toISOString();

                  console.log(`Incoming message V3:`, {
                    id: message.id,
                    from: fromPhone,
                    timestamp: message.timestamp,
                    type: messageType,
                    text: messageContent,
                    image: message.image,
                    document: message.document,
                    audio: message.audio,
                    video: message.video
                  });

                  // Buscar customer_id por teléfono
                  const { data: customerData } = await supabase
                    .from('customers')
                    .select('id')
                    .eq('phone', fromPhone)
                    .single();

                  const customerId = customerData?.id || null;

                  // Guardar mensaje entrante
                  const messageData = {
                    whatsapp_message_id: message.id,
                    from_phone: fromPhone,
                    customer_id: customerId,
                    message_type: messageType,
                    message_content: messageContent,
                    media_url: mediaUrl,
                    timestamp: timestamp,
                    raw_data: message
                  };

                  console.log(`Storing message with data V3:`, messageData);

                  const { error: messageError } = await supabase
                    .from('incoming_messages')
                    .insert(messageData);

                  if (messageError) {
                    console.error(`Error storing incoming message V3:`, messageError);
                  } else {
                    console.log(`Incoming message stored successfully with media URL and raw data V3:`, mediaUrl);
                  }

                  // ✅ VERIFICAR CONFIGURACIÓN DEL BOT ANTES DE RESPONDER
                  console.log(`🔍 Verificando configuración del bot...`);
                  
                  const { data: autoResponseSetting } = await supabase
                    .rpc('get_bot_setting', { setting_name: 'auto_response_enabled' });

                  console.log(`⚙️ Auto-response setting:`, autoResponseSetting);

                  if (!autoResponseSetting) {
                    console.log(`🚫 Auto-response is DISABLED - skipping automatic response`);
                    continue; // Saltar al siguiente mensaje sin generar respuesta
                  }

                  // Solo procesar texto para respuestas automáticas
                  if (messageType === 'text') {
                    console.log(`📱 Received text message V3: ${messageContent}`);
                    
                    console.log(`🤖 Auto-response is enabled, generating response...`);
                    
                    // Generar respuesta automática usando IA
                    try {
                      const { data: aiResponseData, error: aiError } = await supabase.functions.invoke('ai-whatsapp-response', {
                        body: {
                          message: messageContent,
                          customerPhone: fromPhone,
                          customerId: customerId
                        }
                      });

                      if (aiError) {
                        console.error(`❌ Error generating AI response V3:`, aiError);
                        continue;
                      }

                      const aiResponse = aiResponseData?.response || 'Lo siento, no puedo procesar tu mensaje en este momento.';
                      console.log(`✅ AI response generated V3: ${aiResponse}`);

                      // Enviar respuesta automática
                      const { error: sendError } = await supabase.functions.invoke('send-whatsapp-notification', {
                        body: {
                          phone: fromPhone,
                          message: aiResponse,
                          customerId: customerId
                        }
                      });

                      if (sendError) {
                        console.error(`❌ Error sending auto-response V3:`, sendError);
                      } else {
                        console.log(`🎉 Auto-response sent successfully V3`);
                        
                        // Guardar respuesta enviada en sent_messages para el chat
                        console.log(`💾 Storing auto-response in sent_messages for chat display...`);
                        const { error: storeError } = await supabase
                          .from('sent_messages')
                          .insert({
                            customer_id: customerId,
                            phone: fromPhone,
                            message: aiResponse,
                            status: 'sent'
                          });

                        if (storeError) {
                          console.error(`❌ Error storing auto-response in chat V3:`, storeError);
                        } else {
                          console.log(`✅ Auto-response stored in chat successfully V3`);
                        }
                      }
                    } catch (aiProcessError) {
                      console.error(`❌ Error in AI processing V3:`, aiProcessError);
                    }
                  }
                }
              }

              // Procesar información de contactos
              if (change.value.contacts) {
                for (const contact of change.value.contacts) {
                  console.log(`Processing contact info V3:`, contact);

                  const contactName = contact.profile?.name || '';
                  const waId = contact.wa_id;
                  
                  // Obtener URL de imagen de perfil si está disponible
                  let profileImageUrl = null;
                  
                  const contactData = {
                    wa_id: waId,
                    profileImageUrl: profileImageUrl,
                    contactName: contactName
                  };

                  console.log(`Contact profile data V3:`, contactData);

                  // Aquí podrías guardar o actualizar información de contacto si es necesario
                }
              }
            }
          }
        }
      }

      return new Response('OK', { status: 200 });

    } catch (error) {
      console.error(`❌ Error processing webhook V3:`, error);
      return new Response('Error', { status: 500 });
    }
  }

  return new Response('Method not allowed', { status: 405 });
});
