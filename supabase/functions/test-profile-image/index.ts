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
    const { phone } = await req.json()
    
    if (!phone) {
      throw new Error('Phone number is required')
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('🧪 Testing profile image for phone:', phone)

    // Get WhatsApp credentials
    const { data: accessTokenData } = await supabaseClient.rpc('get_app_secret', { 
      secret_name: 'META_WHATSAPP_TOKEN' 
    })
    const { data: phoneIdData } = await supabaseClient.rpc('get_app_secret', { 
      secret_name: 'META_WHATSAPP_PHONE_NUMBER_ID' 
    })

    if (!accessTokenData || !phoneIdData) {
      throw new Error('WhatsApp credentials not found')
    }

    console.log('🔑 Using phone number ID:', phoneIdData)

    // Clean phone number
    const cleanPhone = phone.replace(/[\s\-\(\)+]/g, '')
    console.log('📱 Cleaned phone:', cleanPhone)

    // Test different phone formats
    const phoneFormats = [
      cleanPhone,
      `+${cleanPhone}`,
    ]

    let profileUrl = null
    let attempts = []

    for (const phoneFormat of phoneFormats) {
      try {
        console.log('🔄 Testing format:', phoneFormat)
        
        const contactResponse = await fetch(
          `https://graph.facebook.com/v20.0/${phoneIdData}/contacts?contacts=${encodeURIComponent(phoneFormat)}`,
          {
            headers: {
              'Authorization': `Bearer ${accessTokenData}`,
              'Content-Type': 'application/json'
            }
          }
        )
        
        const responseText = await contactResponse.text()
        console.log('📊 Response status:', contactResponse.status)
        console.log('📋 Response body:', responseText)
        
        let contactData
        try {
          contactData = JSON.parse(responseText)
        } catch (parseError) {
          console.error('❌ JSON parse error:', parseError)
          attempts.push({
            format: phoneFormat,
            status: contactResponse.status,
            error: 'Invalid JSON response',
            response: responseText.substring(0, 200)
          })
          continue
        }
        
        attempts.push({
          format: phoneFormat,
          status: contactResponse.status,
          response: contactData,
          success: contactResponse.ok
        })
        
        if (contactResponse.ok && contactData.contacts && contactData.contacts.length > 0) {
          const contact = contactData.contacts[0]
          if (contact.profile && contact.profile.profile_picture_url) {
            console.log('✅ Profile picture found!')
            profileUrl = contact.profile.profile_picture_url
            break
          } else {
            console.log('📭 Contact found but no profile picture')
          }
        }
        
      } catch (formatError) {
        console.error(`❌ Format ${phoneFormat} failed:`, formatError)
        attempts.push({
          format: phoneFormat,
          error: formatError.message
        })
      }
    }

    const result = {
      success: !!profileUrl,
      profileUrl: profileUrl,
      phone: phone,
      cleanPhone: cleanPhone,
      attempts: attempts,
      message: profileUrl ? 'Profile image found successfully' : 'No profile image available (privacy settings or user not found)'
    }

    console.log('🎯 Test completed:', result)

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('❌ Test error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        details: 'Check the function logs for more information'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})