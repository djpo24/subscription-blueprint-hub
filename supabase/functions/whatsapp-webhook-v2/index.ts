
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
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Use the same verify token as configured in Meta Developer Console
    const verifyToken = 'ojitos_webhook_verify'

    if (req.method === 'GET') {
      // Webhook verification - Meta requires this
      const url = new URL(req.url)
      const mode = url.searchParams.get('hub.mode')
      const token = url.searchParams.get('hub.verify_token')
      const challenge = url.searchParams.get('hub.challenge')

      console.log('Webhook V2 verification attempt:', { 
        mode, 
        token, 
        challenge,
        expectedToken: verifyToken,
        tokenMatch: token === verifyToken
      })

      if (mode === 'subscribe' && token === verifyToken) {
        console.log('Webhook V2 verified successfully')
        return new Response(challenge, { 
          status: 200,
          headers: { 
            'Content-Type': 'text/plain',
            ...corsHeaders
          }
        })
      } else {
        console.log('Webhook V2 verification failed - token mismatch')
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
      console.log('Webhook V2 received:', JSON.stringify(body, null, 2))

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
    console.error('Error in webhook V2:', error)
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
  console.log('Processing messages change:', JSON.stringify(value, null, 2))

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

  // Handle contacts info - extract profile images
  if (value.contacts && Array.isArray(value.contacts)) {
    for (const contact of value.contacts) {
      await handleContactInfo(contact, supabaseClient)
    }
  }
}

async function handleContactInfo(contact: any, supabaseClient: any) {
  const { wa_id, profile } = contact
  
  console.log('Processing contact info:', contact)

  if (!wa_id) return

  // Extract profile image URL if available
  const profileImageUrl = profile?.profile_url || null
  const contactName = profile?.name || null

  console.log('Contact profile data:', {
    wa_id,
    profileImageUrl,
    contactName
  })

  // Try to find existing customer by WhatsApp number with more flexible matching
  const { data: existingCustomers, error: findError } = await supabaseClient
    .from('customers')
    .select('*')
    .or(`phone.ilike.%${wa_id}%,whatsapp_number.ilike.%${wa_id}%`)

  if (findError) {
    console.error('Error finding customer:', findError)
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

  if (bestMatch) {
    // Update existing customer with profile image
    const updateData: any = {}
    
    // Always update profile image if provided, even if it's different
    if (profileImageUrl) {
      updateData.profile_image_url = profileImageUrl
      console.log('Updating profile image URL for existing customer:', profileImageUrl)
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
        console.error('Error updating customer profile:', updateError)
      } else {
        console.log('Customer profile updated successfully:', updateData)
      }
    }
  } else {
    // Create new customer if they don't exist
    const newCustomerData = {
      name: contactName || 'Cliente WhatsApp',
      phone: wa_id,
      whatsapp_number: wa_id,
      email: `${wa_id}@whatsapp.placeholder`,
      profile_image_url: profileImageUrl
    }

    console.log('Creating new customer with profile:', newCustomerData)

    const { error: createError } = await supabaseClient
      .from('customers')
      .insert(newCustomerData)

    if (createError) {
      console.error('Error creating customer from contact:', createError)
    } else {
      console.log('New customer created from WhatsApp contact with profile image')
    }
  }
}

async function handleMessageStatus(status: any, supabaseClient: any) {
  const { id, status: messageStatus, timestamp, recipient_id } = status
  
  console.log('Message status update:', {
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
    console.error('Error fetching notifications:', error)
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

    console.log('Delivery status logged for notification:', matchingNotification.id)
  } else {
    console.log('No matching notification found for message status')
  }
}

async function downloadWhatsAppMedia(mediaId: string, accessToken: string): Promise<string | null> {
  try {
    console.log('Downloading WhatsApp media:', mediaId)
    
    // First, get the media URL
    const mediaResponse = await fetch(`https://graph.facebook.com/v18.0/${mediaId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })
    
    if (!mediaResponse.ok) {
      console.error('Error getting media URL:', await mediaResponse.text())
      return null
    }
    
    const mediaData = await mediaResponse.json()
    const mediaUrl = mediaData.url
    
    console.log('Media URL obtained:', mediaUrl)
    
    // Download the media file
    const fileResponse = await fetch(mediaUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })
    
    if (!fileResponse.ok) {
      console.error('Error downloading media file:', await fileResponse.text())
      return null
    }
    
    const fileBlob = await fileResponse.blob()
    const fileExtension = mediaData.mime_type?.split('/')[1] || 'jpg'
    const fileName = `whatsapp_${mediaId}.${fileExtension}`
    
    console.log('Media downloaded, size:', fileBlob.size, 'bytes')
    
    // Here you would typically upload to your storage
    // For now, we'll return the original URL as placeholder
    return mediaUrl
    
  } catch (error) {
    console.error('Error downloading WhatsApp media:', error)
    return null
  }
}

async function handleIncomingMessage(message: any, supabaseClient: any) {
  const { id, from, timestamp, type, text, image, document, audio, video } = message
  
  console.log('Incoming message:', {
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

  // Try to find customer by phone number with more flexible matching
  const { data: existingCustomers, error: customerError } = await supabaseClient
    .from('customers')
    .select('*')
    .or(`phone.ilike.%${from}%,whatsapp_number.ilike.%${from}%`)

  if (customerError && customerError.code !== 'PGRST116') {
    console.error('Error finding customer:', customerError)
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
      messageContent = image?.caption || '📷 Imagen'
      if (image?.id) {
        // For now, we'll store the media ID and try to download later
        // In production, you'd want to download and store the image
        const accessToken = Deno.env.get('META_WHATSAPP_TOKEN')
        if (accessToken) {
          mediaUrl = await downloadWhatsAppMedia(image.id, accessToken)
        }
      }
      break
    
    case 'document':
      messageContent = document?.caption || `📄 Documento: ${document?.filename || 'archivo'}`
      if (document?.id) {
        const accessToken = Deno.env.get('META_WHATSAPP_TOKEN')
        if (accessToken) {
          mediaUrl = await downloadWhatsAppMedia(document.id, accessToken)
        }
      }
      break
    
    case 'audio':
      messageContent = '🎵 Mensaje de voz'
      if (audio?.id) {
        const accessToken = Deno.env.get('META_WHATSAPP_TOKEN')
        if (accessToken) {
          mediaUrl = await downloadWhatsAppMedia(audio.id, accessToken)
        }
      }
      break
    
    case 'video':
      messageContent = video?.caption || '🎥 Video'
      if (video?.id) {
        const accessToken = Deno.env.get('META_WHATSAPP_TOKEN')
        if (accessToken) {
          mediaUrl = await downloadWhatsAppMedia(video.id, accessToken)
        }
      }
      break
    
    default:
      messageContent = `Mensaje no soportado: ${type}`
      console.log('Unsupported message type:', type, message)
  }

  // Store the incoming message
  const messageData = {
    whatsapp_message_id: id,
    from_phone: from,
    customer_id: customer?.id || null,
    message_type: mediaType,
    message_content: messageContent,
    media_url: mediaUrl,
    timestamp: new Date(parseInt(timestamp) * 1000).toISOString(),
    raw_data: message
  }

  console.log('Storing message with data:', messageData)

  const { error: insertError } = await supabaseClient
    .from('incoming_messages')
    .insert(messageData)

  if (insertError) {
    console.error('Error storing incoming message:', insertError)
  } else {
    console.log('Incoming message stored successfully')
  }

  // If it's a text message, you could implement auto-responses here
  if (type === 'text' && text?.body) {
    console.log('Received text message:', text.body)
    // Add auto-response logic here if needed
  }
}
