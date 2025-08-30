
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { downloadAndStoreAudio } from './audio-storage.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('🔄 Webhook V3 request received:', {
      method: req.method,
      url: req.url,
      headers: Object.fromEntries(req.headers.entries())
    })

    if (req.method === 'GET') {
      const url = new URL(req.url)
      const mode = url.searchParams.get('hub.mode')
      const token = url.searchParams.get('hub.verify_token')
      const challenge = url.searchParams.get('hub.challenge')

      console.log('📋 Webhook verification:', { mode, token, challenge })

      const VERIFY_TOKEN = Deno.env.get('META_WHATSAPP_VERIFY_TOKEN') || 'your-verify-token'
      
      if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        console.log('✅ Webhook verified successfully')
        return new Response(challenge, { status: 200 })
      } else {
        console.log('❌ Webhook verification failed')
        return new Response('Verification failed', { status: 403 })
      }
    }

    if (req.method === 'POST') {
      const body = await req.json()
      console.log('📨 Webhook V3 received POST:', JSON.stringify(body, null, 2))

      const supabaseUrl = Deno.env.get('SUPABASE_URL')!
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      const supabase = createClient(supabaseUrl, supabaseServiceKey)

      // Get WhatsApp token
      const { data: tokenData } = await supabase.rpc('get_app_secret', { secret_name: 'META_WHATSAPP_TOKEN' });
      const whatsappToken = tokenData;

      for (const entry of body.entry || []) {
        for (const change of entry.changes || []) {
          if (change.field === 'messages') {
            console.log('Processing messages change V3:', JSON.stringify(change.value, null, 2))
            
            // Process message statuses
            if (change.value.statuses) {
              for (const status of change.value.statuses) {
                console.log('Message status update V3:', status)
                
                if (status.status === 'delivered' || status.status === 'read') {
                  const { data: notification } = await supabase
                    .from('notification_log')
                    .select('id')
                    .eq('whatsapp_message_id', status.id)
                    .single()

                  if (notification) {
                    await supabase
                      .from('notification_log')
                      .update({ 
                        status: status.status,
                        delivered_at: status.status === 'delivered' ? new Date().toISOString() : undefined,
                        read_at: status.status === 'read' ? new Date().toISOString() : undefined
                      })
                      .eq('id', notification.id)
                    
                    console.log(`Delivery status logged for notification V3: ${notification.id}`)
                  } else {
                    console.log('No matching notification found for message status V3')
                  }
                }
              }
            }
            
            // Process incoming messages
            if (change.value.messages) {
              for (const message of change.value.messages) {
                console.log('📥 Processing incoming message V3:', message)
                
                let mediaUrl = null;
                let messageType = 'text';
                let messageContent = message.text?.body || '';

                // Handle different message types
                if (message.type === 'audio') {
                  console.log('🎵 Processing audio message:', message.audio);
                  messageType = 'audio';
                  messageContent = '🎵 Audio';
                  
                  if (message.audio?.id && whatsappToken) {
                    try {
                      // Get media URL from WhatsApp
                      const mediaResponse = await fetch(`https://graph.facebook.com/v18.0/${message.audio.id}`, {
                        headers: {
                          'Authorization': `Bearer ${whatsappToken}`
                        }
                      });
                      
                      if (mediaResponse.ok) {
                        const mediaData = await mediaResponse.json();
                        console.log('📱 Media data received:', mediaData);
                        
                        if (mediaData.url) {
                          // Download and store audio immediately
                          const storedUrl = await downloadAndStoreAudio(
                            supabase, 
                            mediaData.url, 
                            message.id,
                            whatsappToken
                          );
                          
                          if (storedUrl) {
                            mediaUrl = storedUrl;
                            console.log('✅ Audio stored with new URL:', storedUrl);
                          } else {
                            // Fallback to original URL if storage fails
                            mediaUrl = mediaData.url;
                            console.log('⚠️ Using original URL as fallback');
                          }
                        }
                      }
                    } catch (error) {
                      console.error('❌ Error processing audio:', error);
                    }
                  }
                } else if (message.type === 'image') {
                  messageType = 'image';
                  messageContent = '📷 Imagen';
                  if (message.image?.id && whatsappToken) {
                    // Similar logic for images if needed
                  }
                } else if (message.type === 'document') {
                  messageType = 'document';
                  messageContent = '📄 Documento';
                } else if (message.type === 'video') {
                  messageType = 'video';
                  messageContent = '🎥 Video';
                }

                // Store message in database
                const { error: insertError } = await supabase
                  .from('incoming_messages')
                  .insert({
                    whatsapp_message_id: message.id,
                    from_phone: message.from,
                    message_type: messageType,
                    message_content: messageContent,
                    media_url: mediaUrl,
                    timestamp: new Date(parseInt(message.timestamp) * 1000).toISOString(),
                    is_from_customer: true,
                    raw_message_data: message
                  })

                if (insertError) {
                  console.error('❌ Error inserting message V3:', insertError)
                } else {
                  console.log('✅ Message stored successfully V3')
                }
              }
            }
          }
        }
      }

      return new Response('OK', { 
        status: 200,
        headers: corsHeaders 
      })
    }

    return new Response('Method not allowed', { 
      status: 405,
      headers: corsHeaders 
    })

  } catch (error) {
    console.error('❌ Webhook V3 error:', error)
    return new Response('Internal server error', { 
      status: 500,
      headers: corsHeaders 
    })
  }
})
