
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { testType } = await req.json()

    // Get WhatsApp API credentials from secrets
    const whatsappToken = Deno.env.get('META_WHATSAPP_TOKEN')
    const phoneNumberId = Deno.env.get('META_WHATSAPP_PHONE_NUMBER_ID')
    const verifyToken = Deno.env.get('META_WHATSAPP_VERIFY_TOKEN')

    console.log('Iniciando validación de Meta connection:', { testType })
    console.log('Credenciales disponibles:', {
      hasToken: !!whatsappToken,
      hasPhoneId: !!phoneNumberId,
      hasVerifyToken: !!verifyToken,
      tokenPrefix: whatsappToken ? whatsappToken.substring(0, 10) + '...' : 'N/A',
      phoneId: phoneNumberId || 'N/A'
    })

    switch (testType) {
      case 'token_validation':
        return await validateToken(whatsappToken, phoneNumberId)
      
      case 'phone_number_validation':
        return await validatePhoneNumber(whatsappToken, phoneNumberId)
      
      case 'connectivity_test':
        return await testConnectivity(whatsappToken, phoneNumberId)
      
      default:
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Tipo de prueba no válido',
            availableTests: ['token_validation', 'phone_number_validation', 'connectivity_test']
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
    }

  } catch (error) {
    console.error('Error en validate-meta-connection:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        details: error 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})

async function validateToken(whatsappToken: string | undefined, phoneNumberId: string | undefined) {
  if (!whatsappToken) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'META_WHATSAPP_TOKEN no configurado en Supabase secrets',
        recommendation: 'Configura META_WHATSAPP_TOKEN en la configuración de Supabase'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }

  if (!phoneNumberId) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'META_WHATSAPP_PHONE_NUMBER_ID no configurado en Supabase secrets',
        recommendation: 'Configura META_WHATSAPP_PHONE_NUMBER_ID en la configuración de Supabase'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }

  // Test basic authentication by calling the phone number endpoint
  try {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${phoneNumberId}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${whatsappToken}`,
        }
      }
    )

    const result = await response.json()
    console.log('Token validation response:', response.status, result)

    if (response.ok) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Token válido y autenticado correctamente',
          phoneNumberInfo: result,
          httpStatus: response.status
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    } else {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Token inválido o sin permisos',
          details: result,
          httpStatus: response.status,
          recommendation: 'Verifica que el token tenga los permisos correctos en Meta Business Manager'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Error al conectar con Meta API para validar token',
        details: error.message
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  }
}

async function validatePhoneNumber(whatsappToken: string | undefined, phoneNumberId: string | undefined) {
  if (!whatsappToken || !phoneNumberId) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Credenciales faltantes para validar Phone Number ID'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }

  try {
    // Get phone number details
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${phoneNumberId}?fields=id,verified_name,code_verification_status,display_phone_number`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${whatsappToken}`,
        }
      }
    )

    const result = await response.json()
    console.log('Phone number validation response:', response.status, result)

    if (response.ok) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Phone Number ID válido y configurado correctamente',
          phoneDetails: result,
          httpStatus: response.status
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    } else {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Phone Number ID inválido o no accesible',
          details: result,
          httpStatus: response.status
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Error al validar Phone Number ID',
        details: error.message
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  }
}

async function testConnectivity(whatsappToken: string | undefined, phoneNumberId: string | undefined) {
  if (!whatsappToken || !phoneNumberId) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Credenciales faltantes para test de conectividad'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }

  try {
    // Test general Meta Graph API connectivity
    const graphResponse = await fetch(
      'https://graph.facebook.com/v18.0/me',
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${whatsappToken}`,
        }
      }
    )

    const graphResult = await graphResponse.json()
    console.log('Meta Graph API connectivity test:', graphResponse.status, graphResult)

    // Test WhatsApp Business API specific endpoint
    const waResponse = await fetch(
      `https://graph.facebook.com/v18.0/${phoneNumberId}/message_templates?limit=1`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${whatsappToken}`,
        }
      }
    )

    const waResult = await waResponse.json()
    console.log('WhatsApp Business API connectivity test:', waResponse.status, waResult)

    if (graphResponse.ok && waResponse.ok) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Conectividad exitosa con Meta Graph API y WhatsApp Business API',
          graphApiResult: graphResult,
          whatsappApiResult: waResult,
          timestamps: {
            graphApi: graphResponse.status,
            whatsappApi: waResponse.status
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    } else {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Problemas de conectividad detectados',
          graphApiStatus: graphResponse.status,
          whatsappApiStatus: waResponse.status,
          graphApiResult: graphResult,
          whatsappApiResult: waResult
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Error de conectividad con Meta APIs',
        details: error.message
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  }
}
