
import { supabase } from '@/integrations/supabase/client';

export interface MetaDiagnosticResult {
  success: boolean;
  message: string;
  details?: any;
}

interface DiagnosticResults {
  tokenValidation: MetaDiagnosticResult;
  phoneValidation: MetaDiagnosticResult;
  connectivity: MetaDiagnosticResult;
}

export async function testMetaConnection(): Promise<DiagnosticResults> {
  console.log('🔍 Starting Meta connectivity diagnostics...');

  const results: DiagnosticResults = {
    tokenValidation: { success: false, message: 'No probado' },
    phoneValidation: { success: false, message: 'No probado' },
    connectivity: { success: false, message: 'No probado' }
  };

  try {
    // Get Meta credentials
    const { data: tokenData } = await supabase.rpc('get_app_secret', { secret_name: 'META_WHATSAPP_TOKEN' });
    const { data: phoneData } = await supabase.rpc('get_app_secret', { secret_name: 'META_WHATSAPP_PHONE_NUMBER_ID' });
    
    const token = tokenData;
    const phoneNumberId = phoneData;

    // Test 1: Token validation
    if (!token) {
      results.tokenValidation = {
        success: false,
        message: 'Token no encontrado en los secretos'
      };
    } else if (token.length < 100) {
      results.tokenValidation = {
        success: false,
        message: 'Token parece ser demasiado corto (posiblemente inválido)'
      };
    } else {
      results.tokenValidation = {
        success: true,
        message: 'Token encontrado y con formato válido'
      };
    }

    // Test 2: Phone Number ID validation
    if (!phoneNumberId) {
      results.phoneValidation = {
        success: false,
        message: 'Phone Number ID no encontrado'
      };
    } else if (!/^\d+$/.test(phoneNumberId)) {
      results.phoneValidation = {
        success: false,
        message: 'Phone Number ID tiene formato inválido (debe ser solo números)'
      };
    } else {
      results.phoneValidation = {
        success: true,
        message: 'Phone Number ID válido'
      };
    }

    // Test 3: Connectivity test (try to get WhatsApp Business Account info)
    if (token && phoneNumberId) {
      try {
        const response = await fetch(`https://graph.facebook.com/v18.0/${phoneNumberId}?fields=verified_name,display_phone_number,quality_rating&access_token=${token}`);
        
        if (response.ok) {
          const data = await response.json();
          results.connectivity = {
            success: true,
            message: `Conectividad exitosa - ${data.verified_name || 'Nombre no verificado'}`,
            details: data
          };
        } else {
          const errorData = await response.json();
          results.connectivity = {
            success: false,
            message: `Error ${response.status}: ${errorData.error?.message || 'Error desconocido'}`,
            details: errorData
          };
        }
      } catch (error) {
        results.connectivity = {
          success: false,
          message: `Error de red: ${error.message}`,
          details: error
        };
      }
    } else {
      results.connectivity = {
        success: false,
        message: 'No se puede probar conectividad sin token y Phone Number ID válidos'
      };
    }

  } catch (error) {
    console.error('❌ Error in diagnostics:', error);
    return {
      tokenValidation: { success: false, message: 'Error al obtener credenciales' },
      phoneValidation: { success: false, message: 'Error al obtener credenciales' },
      connectivity: { success: false, message: 'Error al obtener credenciales' }
    };
  }

  return results;
}

export async function testAudioUrl(audioUrl: string): Promise<MetaDiagnosticResult> {
  console.log('🎵 Testing audio URL:', audioUrl);

  try {
    // Validate URL format
    if (!audioUrl.includes('lookaside.fbsbx.com') && !audioUrl.includes('scontent')) {
      return {
        success: false,
        message: 'URL no parece ser de Meta/WhatsApp (debe contener lookaside.fbsbx.com o scontent)'
      };
    }

    // Test direct access (will likely fail due to CORS)
    try {
      const response = await fetch(audioUrl, { 
        method: 'HEAD',
        mode: 'no-cors'
      });
      
      return {
        success: true,
        message: 'URL accesible directamente (inusual)',
        details: { status: response.status, type: response.type }
      };
    } catch (corsError) {
      // Expected CORS error
      return {
        success: false,
        message: 'Error CORS esperado - se requiere proxy del servidor para acceder',
        details: { error: corsError.message, recommendation: 'Usar proxy de servidor' }
      };
    }

  } catch (error) {
    return {
      success: false,
      message: `Error al probar URL: ${error.message}`,
      details: error
    };
  }
}
