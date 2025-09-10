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

    console.log('🔍 Starting profile images migration process...')

    // Get WhatsApp access token
    const { data: accessTokenData } = await supabaseClient.rpc('get_app_secret', { 
      secret_name: 'META_WHATSAPP_TOKEN' 
    })
    const { data: phoneIdData } = await supabaseClient.rpc('get_app_secret', { 
      secret_name: 'META_WHATSAPP_PHONE_NUMBER_ID' 
    })

    if (!accessTokenData || !phoneIdData) {
      throw new Error('WhatsApp credentials not found')
    }

    // Get all customers with WhatsApp numbers but no profile images
    const { data: customers, error: fetchError } = await supabaseClient
      .from('customers')
      .select('*')
      .not('whatsapp_number', 'is', null)
      .or('profile_image_url.is.null,profile_image_url.eq.')

    if (fetchError) {
      throw fetchError
    }

    console.log(`📊 Found ${customers?.length || 0} customers to check for profile images`)

    if (!customers || customers.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No customers found that need profile image migration',
          processed: 0 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    let successCount = 0
    let failureCount = 0
    const results = []

    // Process each customer
    for (const customer of customers) {
      try {
        console.log(`🔄 Processing customer ${customer.id} (${customer.name})...`)
        
        const whatsappNumber = customer.whatsapp_number || customer.phone
        if (!whatsappNumber) {
          console.log(`⚠️ No WhatsApp number for customer ${customer.id}`)
          failureCount++
          results.push({
            customerId: customer.id,
            customerName: customer.name,
            success: false,
            error: 'No WhatsApp number'
          })
          continue
        }

        // Clean phone number (remove + and other characters)
        const cleanPhone = whatsappNumber.replace(/[\s\-\(\)+]/g, '')
        console.log(`📱 Checking profile for phone: ${cleanPhone}`)

        // Try to get profile info from WhatsApp Business API
        const profileUrl = await getWhatsAppProfile(cleanPhone, accessTokenData)

        if (profileUrl) {
          // Download and store the profile image permanently
          const permanentUrl = await downloadProfileImage(profileUrl, cleanPhone, supabaseClient)

          if (permanentUrl) {
            // Update the customer with the new permanent URL
            const { error: updateError } = await supabaseClient
              .from('customers')
              .update({ profile_image_url: permanentUrl })
              .eq('id', customer.id)

            if (updateError) {
              throw updateError
            }

            console.log(`✅ Successfully migrated profile image for customer ${customer.name}`)
            console.log(`🔗 Profile URL: ${permanentUrl}`)
            
            successCount++
            results.push({
              customerId: customer.id,
              customerName: customer.name,
              success: true,
              profileUrl: permanentUrl
            })
          } else {
            console.log(`❌ Failed to download profile image for customer ${customer.name}`)
            failureCount++
            results.push({
              customerId: customer.id,
              customerName: customer.name,
              success: false,
              error: 'Download failed'
            })
          }
        } else {
          console.log(`📭 No profile image available for customer ${customer.name}`)
          failureCount++
          results.push({
            customerId: customer.id,
            customerName: customer.name,
            success: false,
            error: 'No profile image available'
          })
        }

        // Small delay to avoid overwhelming WhatsApp API
        await new Promise(resolve => setTimeout(resolve, 200))
        
      } catch (error) {
        console.error(`❌ Error processing customer ${customer.id}:`, error)
        failureCount++
        results.push({
          customerId: customer.id,
          customerName: customer.name,
          success: false,
          error: error.message
        })
      }
    }

    console.log(`🎯 Profile migration completed: ${successCount} successful, ${failureCount} failed`)

    return new Response(
      JSON.stringify({ 
        success: true,
        migrated: successCount,
        failed: failureCount,
        total: customers.length,
        results: results
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('❌ Profile migration error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})

async function getWhatsAppProfile(phoneNumber: string, accessToken: string): Promise<string | null> {
  try {
    console.log('🔍 Getting WhatsApp profile for:', phoneNumber)
    
    // Try to get profile from WhatsApp Business API
    const response = await fetch(`https://graph.facebook.com/v18.0/${phoneNumber}/profile`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })
    
    if (!response.ok) {
      console.log('❌ Profile not available or accessible for:', phoneNumber)
      return null
    }
    
    const profileData = await response.json()
    const profileImageUrl = profileData?.profile_picture_url || profileData?.picture?.data?.url
    
    console.log('📸 Profile image URL found:', profileImageUrl)
    return profileImageUrl
    
  } catch (error) {
    console.error('❌ Error getting WhatsApp profile:', error)
    return null
  }
}

async function downloadProfileImage(profileImageUrl: string, phoneNumber: string, supabaseClient: any): Promise<string | null> {
  try {
    console.log('🔄 Downloading and storing profile image:', profileImageUrl, 'for:', phoneNumber)
    
    // Download the profile image
    const imageResponse = await fetch(profileImageUrl)
    
    if (!imageResponse.ok) {
      console.error('❌ Error downloading profile image:', await imageResponse.text())
      return null
    }
    
    // Get file extension based on content type
    const contentType = imageResponse.headers.get('content-type') || 'image/jpeg'
    const fileExtension = contentType.includes('png') ? '.png' :
                         contentType.includes('webp') ? '.webp' :
                         contentType.includes('gif') ? '.gif' : '.jpg'
    
    // Create unique filename for migrated profile image
    const fileName = `migrated_profile_${phoneNumber}_${Date.now()}${fileExtension}`
    const filePath = `whatsapp-media/profiles/${fileName}`
    
    // Convert response to ArrayBuffer
    const imageBuffer = await imageResponse.arrayBuffer()
    
    console.log('💾 Storing migrated profile image in Supabase Storage:', filePath, 'Size:', imageBuffer.byteLength, 'bytes')
    
    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabaseClient.storage
      .from('whatsapp-media')
      .upload(filePath, imageBuffer, {
        contentType: contentType,
        upsert: false
      })
    
    if (uploadError) {
      console.error('❌ Error uploading migrated profile image to Supabase Storage:', uploadError)
      return null
    }
    
    console.log('✅ Migrated profile image uploaded successfully:', uploadData.path)
    
    // Get public URL for the stored file
    const { data: publicUrlData } = supabaseClient.storage
      .from('whatsapp-media')
      .getPublicUrl(filePath)
    
    const permanentUrl = publicUrlData?.publicUrl
    console.log('🔗 Permanent migrated profile URL created:', permanentUrl)
    
    return permanentUrl
    
  } catch (error) {
    console.error('❌ Error downloading and storing migrated profile image:', error)
    return null
  }
}