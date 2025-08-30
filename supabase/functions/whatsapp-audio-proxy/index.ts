
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
    const { audioUrl } = await req.json()
    
    console.log('🎵 Proxying audio request for URL:', audioUrl)

    if (!audioUrl) {
      throw new Error('URL de audio requerida')
    }

    // Create a Supabase client to get WhatsApp credentials
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get WhatsApp token
    let whatsappToken;
    try {
      const { data: tokenData } = await supabase.rpc('get_app_secret', { secret_name: 'META_WHATSAPP_TOKEN' });
      whatsappToken = tokenData || Deno.env.get('META_WHATSAPP_TOKEN');
    } catch (error) {
      whatsappToken = Deno.env.get('META_WHATSAPP_TOKEN');
    }

    if (!whatsappToken) {
      throw new Error('Token de WhatsApp no configurado')
    }

    console.log('📡 Fetching audio with token from Meta API...')

    // Fetch the audio file from WhatsApp API
    const response = await fetch(audioUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${whatsappToken}`,
        'User-Agent': 'WhatsApp-Audio-Proxy/1.0'
      }
    })

    if (!response.ok) {
      console.error('❌ Error fetching audio:', response.status, response.statusText)
      throw new Error(`Error ${response.status}: ${response.statusText}`)
    }

    console.log('✅ Audio fetched successfully, content-type:', response.headers.get('content-type'))

    // Get the audio data
    const audioData = await response.arrayBuffer()
    const contentType = response.headers.get('content-type') || 'audio/ogg'

    // Return the audio data with proper headers
    return new Response(audioData, {
      headers: {
        ...corsHeaders,
        'Content-Type': contentType,
        'Content-Length': audioData.byteLength.toString(),
        'Cache-Control': 'public, max-age=3600',
        'Accept-Ranges': 'bytes'
      }
    })

  } catch (error) {
    console.error('❌ Error in audio proxy:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'No se pudo obtener el archivo de audio desde WhatsApp'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
