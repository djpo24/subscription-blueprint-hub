
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
    const { testType } = await req.json()
    
    console.log('Iniciando validación Meta:', testType)

    // Create a Supabase client with service role to get secrets
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get WhatsApp API credentials from app_secrets table
    let whatsappToken, phoneNumberId, verifyToken;

    try {
      // Try to get from app_secrets table first
      const { data: tokenData } = await supabase.rpc('get_app_secret', { secret_name: 'META_WHATSAPP_TOKEN' });
      const { data: phoneData } = await supabase.rpc('get_app_secret', { secret_name: 'META_WHATSAPP_PHONE_NUMBER_ID' });
      const { data: verifyData } = await supabase.rpc('get_app_secret', { secret_name: 'META_WHATSAPP_VERIFY_TOKEN' });

      whatsappToken = tokenData || Deno.env.get('META_WHATSAPP_TOKEN');
      phoneNumberId = phoneData || Deno.env.get('META_WHATSAPP_PHONE_NUMBER_ID');
      verifyToken = verifyData || Deno.env.get('META_WHATSAPP_VERIFY_TOKEN');
    } catch (error) {
      console.log('Error getting from app_secrets, falling back to env vars:', error);
      // Fallback to environment variables
      whatsappToken = Deno.env.get('META_WHATSAPP_TOKEN');
      phoneNumberId = Deno.env.get('META_WHATSAPP_PHONE_NUMBER_ID');
      verifyToken = Deno.env.get('META_WHATSAPP_VERIFY_TOKEN');
    }

    console.log('Credenciales encontradas:', {
      token: whatsappToken ? 'Sí' : 'No',
      phoneId: phoneNumberId ? 'Sí' : 'No',
      verifyToken: verifyToken ? 'Sí' : 'No'
    })

    if (!whatsappToken || !phoneNumberId) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Credenciales de WhatsApp no configuradas',
          details: {
            token: !!whatsappToken,
            phoneNumberId: !!phoneNumberId,
            verifyToken: !!verifyToken
          }
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    switch (testType) {
      case 'token_validation':
        // Validate token by checking account info
        try {
          const response = await fetch(
            `https://graph.facebook.com/v18.0/me?access_token=${whatsappToken}`,
            {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${whatsappToken}`,
              }
            }
          )

          const result = await response.json()
          console.log('Token validation response:', result)

          if (response.ok && result.id) {
            return new Response(
              JSON.stringify({ 
                success: true, 
                message: 'Token válido',
                details: { accountId: result.id, accountName: result.name }
              }),
              { 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200 
              }
            )
          } else {
            return new Response(
              JSON.stringify({ 
                success: false, 
                error: 'Token inválido',
                details: result
              }),
              { 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200 
              }
            )
          }
        } catch (error) {
          console.error('Error validating token:', error)
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'Error al validar token',
              details: error.message
            }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 200 
            }
          )
        }

      case 'phone_number_validation':
        // Validate phone number ID
        try {
          const response = await fetch(
            `https://graph.facebook.com/v18.0/${phoneNumberId}?access_token=${whatsappToken}`,
            {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${whatsappToken}`,
              }
            }
          )

          const result = await response.json()
          console.log('Phone validation response:', result)

          if (response.ok && result.id) {
            return new Response(
              JSON.stringify({ 
                success: true, 
                message: 'Phone Number ID válido',
                details: { 
                  phoneNumberId: result.id, 
                  displayName: result.display_phone_number,
                  verifiedName: result.verified_name,
                  status: result.code_verification_status
                }
              }),
              { 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200 
              }
            )
          } else {
            return new Response(
              JSON.stringify({ 
                success: false, 
                error: 'Phone Number ID inválido',
                details: result
              }),
              { 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200 
              }
            )
          }
        } catch (error) {
          console.error('Error validating phone number ID:', error)
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'Error al validar Phone Number ID',
              details: error.message
            }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 200 
            }
          )
        }

      case 'connectivity_test':
        // Test general connectivity to Meta API
        try {
          const response = await fetch(
            'https://graph.facebook.com/v18.0/',
            {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${whatsappToken}`,
              }
            }
          )

          if (response.ok) {
            return new Response(
              JSON.stringify({ 
                success: true, 
                message: 'Conectividad exitosa con Meta API',
                details: { statusCode: response.status }
              }),
              { 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200 
              }
            )
          } else {
            return new Response(
              JSON.stringify({ 
                success: false, 
                message: 'Problemas de conectividad',
                details: { statusCode: response.status }
              }),
              { 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200 
              }
            )
          }
        } catch (error) {
          console.error('Error testing connectivity:', error)
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'Error de conectividad',
              details: error.message
            }),
            { 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 200 
            }
          )
        }

      default:
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Tipo de prueba no válido' 
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400 
          }
        )
    }

  } catch (error) {
    console.error('Error en validate-meta-connection:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})
