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

    // Get WhatsApp access token
    const { data: accessTokenData } = await supabaseClient.rpc('get_app_secret', { 
      secret_name: 'META_WHATSAPP_TOKEN' 
    })

    if (!accessTokenData) {
      throw new Error('WhatsApp access token not found')
    }

    console.log('🔍 Starting audio migration process...')

    // Get all audio messages with temporary URLs that need migration
    const { data: audioMessages, error: fetchError } = await supabaseClient
      .from('incoming_messages')
      .select('*')
      .eq('message_type', 'audio')
      .not('media_url', 'is', null)
      .not('raw_data', 'is', null)
      // Only migrate messages with lookaside URLs (temporary ones)
      .like('media_url', '%lookaside.fbsbx.com%')

    if (fetchError) {
      throw fetchError
    }

    console.log(`📊 Found ${audioMessages?.length || 0} audio messages to migrate`)

    if (!audioMessages || audioMessages.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No audio messages found that need migration',
          migrated: 0 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    let successCount = 0
    let failureCount = 0
    const results = []

    // Process each audio message
    for (const message of audioMessages) {
      try {
        console.log(`🔄 Processing message ${message.id}...`)
        
        // Extract media_id from raw_data
        const audioData = message.raw_data?.audio
        const mediaId = audioData?.id

        if (!mediaId) {
          console.log(`⚠️ No media_id found in raw_data for message ${message.id}`)
          failureCount++
          results.push({
            messageId: message.id,
            success: false,
            error: 'No media_id in raw_data'
          })
          continue
        }

        console.log(`📱 Found media_id: ${mediaId} for message ${message.id}`)

        // Download and store the audio permanently
        const permanentUrl = await downloadWhatsAppMedia(mediaId, accessTokenData, supabaseClient, 'audio')

        if (permanentUrl && permanentUrl !== message.media_url) {
          // Update the message with the new permanent URL
          const { error: updateError } = await supabaseClient
            .from('incoming_messages')
            .update({ media_url: permanentUrl })
            .eq('id', message.id)

          if (updateError) {
            throw updateError
          }

          console.log(`✅ Successfully migrated audio for message ${message.id}`)
          console.log(`🔗 Old URL: ${message.media_url}`)
          console.log(`🔗 New URL: ${permanentUrl}`)
          
          successCount++
          results.push({
            messageId: message.id,
            success: true,
            oldUrl: message.media_url,
            newUrl: permanentUrl
          })
        } else {
          console.log(`❌ Failed to download audio for message ${message.id}`)
          failureCount++
          results.push({
            messageId: message.id,
            success: false,
            error: 'Download failed or same URL'
          })
        }

        // Small delay to avoid overwhelming WhatsApp API
        await new Promise(resolve => setTimeout(resolve, 100))
        
      } catch (error) {
        console.error(`❌ Error processing message ${message.id}:`, error)
        failureCount++
        results.push({
          messageId: message.id,
          success: false,
          error: error.message
        })
      }
    }

    console.log(`🎯 Migration completed: ${successCount} successful, ${failureCount} failed`)

    return new Response(
      JSON.stringify({ 
        success: true,
        migrated: successCount,
        failed: failureCount,
        total: audioMessages.length,
        results: results
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('❌ Migration error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})

async function downloadWhatsAppMedia(mediaId: string, accessToken: string, supabaseClient: any, messageType: string): Promise<string | null> {
  try {
    console.log('🔄 Downloading and storing WhatsApp media (migration):', mediaId, 'Type:', messageType)
    
    // First, get the media URL from WhatsApp
    const mediaResponse = await fetch(`https://graph.facebook.com/v18.0/${mediaId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })
    
    if (!mediaResponse.ok) {
      console.error('❌ Error getting media URL (migration):', await mediaResponse.text())
      return null
    }
    
    const mediaData = await mediaResponse.json()
    const temporaryUrl = mediaData.url
    
    console.log('📥 Temporary media URL obtained from WhatsApp (migration):', temporaryUrl)
    
    // Download the actual media file
    const fileResponse = await fetch(temporaryUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })
    
    if (!fileResponse.ok) {
      console.error('❌ Error downloading media file (migration):', await fileResponse.text())
      return null
    }
    
    // Get file extension based on content type or message type
    const contentType = fileResponse.headers.get('content-type') || ''
    let fileExtension = ''
    
    if (messageType === 'audio') {
      fileExtension = contentType.includes('ogg') ? '.ogg' : 
                     contentType.includes('opus') ? '.opus' :
                     contentType.includes('mp3') ? '.mp3' :
                     contentType.includes('aac') ? '.aac' :
                     contentType.includes('amr') ? '.amr' : '.ogg'
    }
    
    // Create unique filename for migrated file
    const fileName = `migrated_${messageType}_${mediaId}_${Date.now()}${fileExtension}`
    const filePath = `whatsapp-media/${fileName}`
    
    // Convert response to ArrayBuffer
    const fileBuffer = await fileResponse.arrayBuffer()
    
    console.log('💾 Storing migrated media file in Supabase Storage:', filePath, 'Size:', fileBuffer.byteLength, 'bytes')
    
    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabaseClient.storage
      .from('whatsapp-media')
      .upload(filePath, fileBuffer, {
        contentType: contentType,
        upsert: false
      })
    
    if (uploadError) {
      console.error('❌ Error uploading migrated media to Supabase Storage:', uploadError)
      return null
    }
    
    console.log('✅ Migrated media file uploaded successfully:', uploadData.path)
    
    // Get public URL for the stored file
    const { data: publicUrlData } = supabaseClient.storage
      .from('whatsapp-media')
      .getPublicUrl(filePath)
    
    const permanentUrl = publicUrlData?.publicUrl
    console.log('🔗 Permanent migrated media URL created:', permanentUrl)
    
    return permanentUrl
    
  } catch (error) {
    console.error('❌ Error downloading and storing migrated WhatsApp media:', error)
    return null
  }
}