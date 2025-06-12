
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
    console.log('🔄 Webhook V3 request received:', {
      method: req.method,
      url: req.url,
      headers: Object.fromEntries(req.headers.entries())
    })

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get verify token from app secrets
    const { data: verifyTokenData } = await supabaseClient.rpc('get_app_secret', { 
      secret_name: 'META_WHATSAPP_VERIFY_TOKEN' 
    })
    const verifyToken = verifyTokenData || 'ojitos_webhook_verify'

    if (req.method === 'GET') {
      // Webhook verification - Meta requires this
      const url = new URL(req.url)
      const mode = url.searchParams.get('hub.mode')
      const token = url.searchParams.get('hub.verify_token')
      const challenge = url.searchParams.get('hub.challenge')

      console.log('🔍 Webhook V3 verification attempt:', { 
        mode, 
        token, 
        challenge,
        expectedToken: verifyToken,
        tokenMatch: token === verifyToken
      })

      if (mode === 'subscribe' && token === verifyToken) {
        console.log('✅ Webhook V3 verified successfully')
        return new Response(challenge, { 
          status: 200,
          headers: { 
            'Content-Type': 'text/plain',
            ...corsHeaders
          }
        })
      } else {
        console.log('❌ Webhook V3 verification failed - token mismatch')
        console.log(`Expected: ${verifyToken}, Received: ${token}`)
        return new Response('Forbidden', { 
          status: 403,
          headers: corsHeaders
        })
      }
    }

    if (req.method === 'POST') {
      // Handle webhook events
      const body = await req.json()
      console.log('📨 Webhook V3 received POST:', JSON.stringify(body, null, 2))

      // Process webhook entries
      if (body.entry && Array.isArray(body.entry)) {
        for (const entry of body.entry) {
          if (entry.changes) {
            for (const change of entry.changes) {
              if (change.field === 'messages') {
                await processMessagesChange(change.value, supabaseClient)
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
    console.error('❌ Error in webhook V3:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})

async function processMessagesChange(value: any, supabaseClient: any) {
  console.log('Processing messages change V3:', JSON.stringify(value, null, 2))

  // Handle message status updates
  if (value.statuses && Array.isArray(value.statuses)) {
    for (const status of value.statuses) {
      await handleMessageStatus(status, supabaseClient)
    }
  }

  // Handle incoming messages (replies from customers)
  if (value.messages && Array.isArray(value.messages)) {
    for (const message of value.messages) {
      await handleIncomingMessage(message, supabaseClient)
    }
  }

  // Handle contacts info - SOLO ACTUALIZAR CLIENTES EXISTENTES
  if (value.contacts && Array.isArray(value.contacts)) {
    for (const contact of value.contacts) {
      await handleContactInfo(contact, supabaseClient)
    }
  }
}

async function handleContactInfo(contact: any, supabaseClient: any) {
  const { wa_id, profile } = contact
  
  console.log('Processing contact info V3:', contact)

  if (!wa_id) return

  // Extract profile image URL if available
  const profileImageUrl = profile?.profile_url || null
  const contactName = profile?.name || null

  console.log('Contact profile data V3:', {
    wa_id,
    profileImageUrl,
    contactName
  })

  // 🔒 BUSCAR SOLO CLIENTES EXISTENTES - NO CREAR NUEVOS
  const { data: existingCustomers, error: findError } = await supabaseClient
    .from('customers')
    .select('*')
    .or(`phone.ilike.%${wa_id}%,whatsapp_number.ilike.%${wa_id}%`)

  if (findError) {
    console.error('Error finding customer V3:', findError)
    return
  }

  // Find the best match for the phone number
  let bestMatch = null
  if (existingCustomers && existingCustomers.length > 0) {
    bestMatch = existingCustomers.find(customer => {
      const customerPhone = (customer.whatsapp_number || customer.phone || '').replace(/[\s\-\(\)+]/g, '')
      const waIdClean = wa_id.replace(/[\s\-\(\)+]/g, '')
      return customerPhone === waIdClean || customerPhone.endsWith(waIdClean) || waIdClean.endsWith(customerPhone)
    }) || existingCustomers[0]
  }

  // 🚫 SOLO ACTUALIZAR CLIENTES EXISTENTES - NUNCA CREAR NUEVOS
  if (bestMatch) {
    console.log('📋 Actualizando cliente existente V3:', bestMatch.name)
    
    // Update existing customer with profile image
    const updateData: any = {}
    
    // Always update profile image if provided, even if it's different
    if (profileImageUrl) {
      updateData.profile_image_url = profileImageUrl
      console.log('Updating profile image URL for existing customer V3:', profileImageUrl)
    }
    
    // Update WhatsApp number if not set
    if (!bestMatch.whatsapp_number && wa_id) {
      updateData.whatsapp_number = wa_id
    }
    
    // Only update name if customer doesn't have one or WhatsApp provides a different one
    if (contactName && (!bestMatch.name || bestMatch.name === 'Cliente' || bestMatch.name === '.')) {
      updateData.name = contactName
    }

    if (Object.keys(updateData).length > 0) {
      const { error: updateError } = await supabaseClient
        .from('customers')
        .update(updateData)
        .eq('id', bestMatch.id)

      if (updateError) {
        console.error('Error updating customer profile V3:', updateError)
      } else {
        console.log('Customer profile updated successfully V3:', updateData)
      }
    }
  } else {
    // 🚫 NUNCA CREAR NUEVOS CLIENTES AUTOMÁTICAMENTE
    console.log('⚠️ Número no registrado en la plataforma V3:', wa_id)
    console.log('🚫 No se creará cliente automáticamente - política de seguridad')
  }
}

async function handleMessageStatus(status: any, supabaseClient: any) {
  const { id, status: messageStatus, timestamp, recipient_id } = status
  
  console.log('Message status update V3:', {
    id,
    status: messageStatus,
    timestamp,
    recipient_id
  })

  // Try to find the notification log entry by checking recent notifications
  // to the same phone number around the time this message was sent
  const { data: notifications, error } = await supabaseClient
    .from('notification_log')
    .select(`
      *,
      customers (
        phone,
        whatsapp_number
      )
    `)
    .eq('status', 'sent')
    .order('sent_at', { ascending: false })
    .limit(50)

  if (error) {
    console.error('Error fetching notifications V3:', error)
    return
  }

  // Find matching notification by phone number
  const matchingNotification = notifications?.find(notification => {
    const phone = notification.customers?.whatsapp_number || notification.customers?.phone
    if (!phone) return false
    
    const cleanPhone = phone.replace(/[\s\-\(\)+]/g, '')
    const cleanRecipient = recipient_id.replace(/[\s\-\(\)+]/g, '')
    
    return cleanPhone.includes(cleanRecipient) || cleanRecipient.includes(cleanPhone)
  })

  if (matchingNotification) {
    // Create a delivery status log
    await supabaseClient
      .from('message_delivery_status')
      .insert({
        notification_id: matchingNotification.id,
        whatsapp_message_id: id,
        status: messageStatus,
        timestamp: new Date(parseInt(timestamp) * 1000).toISOString(),
        recipient_phone: recipient_id
      })

    console.log('Delivery status logged for notification V3:', matchingNotification.id)
  } else {
    console.log('No matching notification found for message status V3')
  }
}

async function downloadWhatsAppMedia(mediaId: string, accessToken: string): Promise<string | null> {
  try {
    console.log('Downloading WhatsApp media V3:', mediaId)
    
    // First, get the media URL
    const mediaResponse = await fetch(`https://graph.facebook.com/v18.0/${mediaId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })
    
    if (!mediaResponse.ok) {
      console.error('Error getting media URL V3:', await mediaResponse.text())
      return null
    }
    
    const mediaData = await mediaResponse.json()
    const mediaUrl = mediaData.url
    
    console.log('Media URL obtained from WhatsApp V3:', mediaUrl)
    
    // Return the URL directly - this is a temporary URL provided by WhatsApp
    // In production, you would want to download the file and store it permanently
    return mediaUrl
    
  } catch (error) {
    console.error('Error downloading WhatsApp media V3:', error)
    return null
  }
}

async function handleAdminResponse(message: any, supabaseClient: any): Promise<boolean> {
  const { text, from } = message
  
  if (!text?.body) {
    console.log('📋 Admin message without text content, skipping escalation processing')
    return false
  }
  
  console.log('🔧 Processing admin response:', text.body.substring(0, 100) + '...')
  
  // Buscar escalación pendiente más reciente
  const { data: pendingEscalation, error: escalationError } = await supabaseClient
    .from('admin_escalations')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()
  
  if (escalationError && escalationError.code !== 'PGRST116') {
    console.error('❌ Error finding pending escalation:', escalationError)
    return false
  }
  
  if (!pendingEscalation) {
    console.log('📋 No pending escalations found, treating as general admin message')
    return false
  }
  
  console.log('✅ Found pending escalation:', pendingEscalation.id)
  
  // Marcar escalación como respondida
  const { error: updateError } = await supabaseClient
    .from('admin_escalations')
    .update({
      admin_response: text.body,
      status: 'answered',
      answered_at: new Date().toISOString()
    })
    .eq('id', pendingEscalation.id)
  
  if (updateError) {
    console.error('❌ Error updating escalation:', updateError)
    return false
  }
  
  console.log('✅ Escalation marked as answered')
  
  // Enviar respuesta del admin al cliente original
  const { data: sendData, error: sendError } = await supabaseClient.functions.invoke('send-whatsapp-notification', {
    body: {
      phone: pendingEscalation.customer_phone,
      message: text.body,
      isAdminResponse: true
    }
  })
  
  if (sendError) {
    console.error('❌ Error sending admin response to customer:', sendError)
  } else {
    console.log('✅ Admin response sent to customer successfully')
    
    // Almacenar la respuesta del admin en sent_messages para el historial
    await supabaseClient
      .from('sent_messages')
      .insert({
        customer_id: null,
        phone: pendingEscalation.customer_phone,
        message: text.body,
        status: 'sent',
        whatsapp_message_id: sendData?.whatsapp_message_id || null
      })
  }
  
  return true
}

async function checkAutoResponseSettings() {
  // Check if auto responses are enabled (localStorage values)
  // Since we're in an edge function, we'll assume auto-responses are enabled by default
  // In a real implementation, you might store this in the database
  return {
    isAutoResponseEnabled: true, // Default to enabled
    isManualResponseEnabled: true
  }
}

async function handleIncomingMessage(message: any, supabaseClient: any) {
  const { id, from, timestamp, type, text, image, document, audio, video } = message
  
  console.log('Incoming message V3:', {
    id,
    from,
    timestamp,
    type,
    text: text?.body,
    image: image?.id,
    document: document?.id,
    audio: audio?.id,
    video: video?.id
  })

  // Get access token from app secrets
  const { data: accessTokenData } = await supabaseClient.rpc('get_app_secret', { 
    secret_name: 'META_WHATSAPP_TOKEN' 
  })

  // 🔒 BUSCAR SOLO CLIENTES EXISTENTES - NO CREAR NUEVOS
  const { data: existingCustomers, error: customerError } = await supabaseClient
    .from('customers')
    .select('*')
    .or(`phone.ilike.%${from}%,whatsapp_number.ilike.%${from}%`)

  if (customerError && customerError.code !== 'PGRST116') {
    console.error('Error finding customer V3:', customerError)
    return
  }

  // Find the best match for the phone number
  let customer = null
  if (existingCustomers && existingCustomers.length > 0) {
    customer = existingCustomers.find(c => {
      const customerPhone = (c.whatsapp_number || c.phone || '').replace(/[\s\-\(\)+]/g, '')
      const fromClean = from.replace(/[\s\-\(\)+]/g, '')
      return customerPhone === fromClean || customerPhone.endsWith(fromClean) || fromClean.endsWith(customerPhone)
    }) || existingCustomers[0]
  }

  // Prepare message content and media URL
  let messageContent = ''
  let mediaUrl = null
  let mediaType = type

  // Handle different message types
  switch (type) {
    case 'text':
      messageContent = text?.body || ''
      break
    
    case 'image':
      messageContent = image?.caption || ''
      if (image?.id && accessTokenData) {
        mediaUrl = await downloadWhatsAppMedia(image.id, accessTokenData)
        console.log('Image media URL processed V3:', mediaUrl)
      } else {
        console.error('No access token found for image download V3')
      }
      break
    
    case 'document':
      messageContent = document?.caption || `📄 Documento: ${document?.filename || 'archivo'}`
      if (document?.id && accessTokenData) {
        mediaUrl = await downloadWhatsAppMedia(document.id, accessTokenData)
      }
      break
    
    case 'audio':
      messageContent = '🎵 Mensaje de voz'
      if (audio?.id && accessTokenData) {
        mediaUrl = await downloadWhatsAppMedia(audio.id, accessTokenData)
      }
      break
    
    case 'video':
      messageContent = video?.caption || '🎥 Video'
      if (video?.id && accessTokenData) {
        mediaUrl = await downloadWhatsAppMedia(video.id, accessTokenData)
      }
      break
    
    default:
      messageContent = `Mensaje no soportado: ${type}`
      console.log('Unsupported message type V3:', type, message)
  }

  // Store the incoming message with raw_data for debugging
  const messageData = {
    whatsapp_message_id: id,
    from_phone: from,
    customer_id: customer?.id || null,
    message_type: mediaType,
    message_content: messageContent,
    media_url: mediaUrl,
    timestamp: new Date(parseInt(timestamp) * 1000).toISOString(),
    raw_data: message // Store complete webhook payload for debugging
  }

  console.log('Storing message with data V3:', messageData)

  const { error: insertError } = await supabaseClient
    .from('incoming_messages')
    .insert(messageData)

  if (insertError) {
    console.error('Error storing incoming message V3:', insertError)
    return
  } else {
    console.log('Incoming message stored successfully with media URL and raw data V3:', mediaUrl)
  }

  // 🤖 AUTO RESPONSE LOGIC - Only for text messages
  if (type === 'text' && text?.body) {
    console.log('📱 Received text message V3:', text.body)
    
    // Check if auto-responses are enabled
    const autoSettings = await checkAutoResponseSettings()
    
    if (autoSettings.isAutoResponseEnabled) {
      console.log('🤖 Auto-response is enabled, generating response...')
      
      try {
        // Generate AI response - even if customer is not found, let AI handle it
        const { data: aiResponse, error: aiError } = await supabaseClient.functions.invoke('ai-whatsapp-response', {
          body: {
            message: text.body,
            customerPhone: from,
            customerId: customer?.id || null
          }
        })

        if (aiError) {
          console.error('❌ Error generating AI response V3:', aiError)
          return
        }

        if (aiResponse?.response) {
          console.log('✅ AI response generated V3:', aiResponse.response.substring(0, 100) + '...')
          
          // Send the AI response back via WhatsApp
          const { data: sendData, error: sendError } = await supabaseClient.functions.invoke('send-whatsapp-notification', {
            body: {
              phone: from,
              message: aiResponse.response,
              customerId: customer?.id || null,
              isAutoResponse: true
            }
          })

          if (sendError) {
            console.error('❌ Error sending auto-response V3:', sendError)
          } else {
            console.log('🎉 Auto-response sent successfully V3')
            
            // 📝 STORE AUTO-RESPONSE IN CHAT - This is the key addition
            console.log('💾 Storing auto-response in sent_messages for chat display...')
            
            const { error: storeChatError } = await supabaseClient
              .from('sent_messages')
              .insert({
                customer_id: customer?.id || null,
                phone: from,
                message: aiResponse.response,
                status: 'sent',
                whatsapp_message_id: sendData?.whatsapp_message_id || null
              })

            if (storeChatError) {
              console.error('❌ Error storing auto-response in chat V3:', storeChatError)
            } else {
              console.log('✅ Auto-response stored in chat successfully V3')
            }
          }
        }
      } catch (autoResponseError) {
        console.error('❌ Error in auto-response process V3:', autoResponseError)
      }
    } else {
      console.log('🔕 Auto-response is disabled, skipping automatic reply')
    }
  }
}
