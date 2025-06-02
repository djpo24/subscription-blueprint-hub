
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

    const verifyToken = Deno.env.get('META_WHATSAPP_VERIFY_TOKEN')

    if (req.method === 'GET') {
      // Webhook verification - Meta requires this
      const url = new URL(req.url)
      const mode = url.searchParams.get('hub.mode')
      const token = url.searchParams.get('hub.verify_token')
      const challenge = url.searchParams.get('hub.challenge')

      console.log('Webhook verification attempt:', { mode, token, challenge })

      if (mode === 'subscribe' && token === verifyToken) {
        console.log('Webhook verified successfully')
        return new Response(challenge, { 
          status: 200,
          headers: { 'Content-Type': 'text/plain' }
        })
      } else {
        console.log('Webhook verification failed')
        return new Response('Forbidden', { status: 403 })
      }
    }

    if (req.method === 'POST') {
      // Handle webhook events
      const body = await req.json()
      console.log('Webhook received:', JSON.stringify(body, null, 2))

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
    console.error('Error in webhook:', error)
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

  // Handle contacts info
  if (value.contacts && Array.isArray(value.contacts)) {
    for (const contact of value.contacts) {
      console.log('Contact info:', contact)
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

async function handleIncomingMessage(message: any, supabaseClient: any) {
  const { id, from, timestamp, type, text } = message
  
  console.log('Incoming message:', {
    id,
    from,
    timestamp,
    type,
    text: text?.body
  })

  // Try to find customer by phone number
  const { data: customer, error: customerError } = await supabaseClient
    .from('customers')
    .select('*')
    .or(`phone.ilike.%${from}%,whatsapp_number.ilike.%${from}%`)
    .limit(1)
    .single()

  if (customerError && customerError.code !== 'PGRST116') {
    console.error('Error finding customer:', customerError)
    return
  }

  // Store the incoming message
  await supabaseClient
    .from('incoming_messages')
    .insert({
      whatsapp_message_id: id,
      from_phone: from,
      customer_id: customer?.id || null,
      message_type: type,
      message_content: text?.body || '',
      timestamp: new Date(parseInt(timestamp) * 1000).toISOString(),
      raw_data: message
    })

  console.log('Incoming message stored')

  // If it's a text message, you could implement auto-responses here
  if (type === 'text' && text?.body) {
    console.log('Received text message:', text.body)
    // Add auto-response logic here if needed
  }
}
