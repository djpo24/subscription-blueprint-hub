
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

    // Validar que la URL sea de Meta/WhatsApp
    if (!audioUrl.includes('lookaside.fbsbx.com') && !audioUrl.includes('scontent')) {
      throw new Error('URL no válida - debe ser de Meta/WhatsApp')
    }

    // Create a Supabase client to get WhatsApp credentials
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get WhatsApp token with multiple fallbacks
    let whatsappToken;
    try {
      const { data: tokenData } = await supabase.rpc('get_app_secret', { secret_name: 'META_WHATSAPP_TOKEN' });
      whatsappToken = tokenData || Deno.env.get('META_WHATSAPP_TOKEN');
    } catch (error) {
      console.log('⚠️ RPC fallback, using env token');
      whatsappToken = Deno.env.get('META_WHATSAPP_TOKEN');
    }

    if (!whatsappToken) {
      throw new Error('Token de WhatsApp no configurado')
    }

    console.log('📡 Fetching audio with token from Meta API...')
    console.log('🔑 Token length:', whatsappToken.length)

    // Fetch the audio file from WhatsApp API with enhanced headers
    const response = await fetch(audioUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${whatsappToken}`,
        'User-Agent': 'WhatsApp-Audio-Proxy/1.0',
        'Accept': 'audio/*,*/*;q=0.9',
        'Cache-Control': 'no-cache'
      },
      // Add timeout
      signal: AbortSignal.timeout(30000) // 30 second timeout
    })

    console.log('📊 Response status:', response.status)
    console.log('📊 Response headers:', Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      console.error('❌ Error fetching audio:', response.status, response.statusText)
      
      // Provide specific error messages for common issues
      if (response.status === 404) {
        throw new Error(`Audio no encontrado (404) - La URL puede haber expirado. Estado: ${response.status}`)
      } else if (response.status === 401 || response.status === 403) {
        throw new Error(`Token inválido o sin permisos (${response.status}) - Verifica tu token de WhatsApp`)
      } else if (response.status === 429) {
        throw new Error(`Límite de solicitudes excedido (${response.status}) - Intenta más tarde`)
      } else {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }
    }

    console.log('✅ Audio fetched successfully, content-type:', response.headers.get('content-type'))

    // Get the audio data
    const audioArrayBuffer = await response.arrayBuffer()
    const contentType = response.headers.get('content-type') || 'audio/ogg'
    
    console.log('📦 Audio size:', audioArrayBuffer.byteLength, 'bytes')

    // Validate audio data
    if (audioArrayBuffer.byteLength === 0) {
      throw new Error('El archivo de audio está vacío')
    }

    // Return the audio data with proper headers
    return new Response(audioArrayBuffer, {
      headers: {
        ...corsHeaders,
        'Content-Type': contentType,
        'Content-Length': audioArrayBuffer.byteLength.toString(),
        'Cache-Control': 'public, max-age=3600',
        'Accept-Ranges': 'bytes',
        'Access-Control-Expose-Headers': 'Content-Type, Content-Length'
      }
    })

  } catch (error) {
    console.error('❌ Error in audio proxy:', error)
    
    let errorMessage = 'Error desconocido al obtener el audio'
    let statusCode = 500
    
    if (error.name === 'AbortError') {
      errorMessage = 'Timeout - La solicitud tardó demasiado'
      statusCode = 408
    } else if (error.message) {
      errorMessage = error.message
      if (error.message.includes('404')) statusCode = 404
      if (error.message.includes('401') || error.message.includes('403')) statusCode = 401
      if (error.message.includes('429')) statusCode = 429
    }
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: 'No se pudo obtener el archivo de audio desde WhatsApp',
        timestamp: new Date().toISOString(),
        originalUrl: error.originalUrl || 'URL no disponible'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: statusCode 
      }
    )
  }
})
