
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface MetaDiagnosticResult {
  success: boolean;
  message: string;
  details?: any;
}

export async function testMetaConnection(): Promise<{
  tokenValidation: MetaDiagnosticResult;
  phoneValidation: MetaDiagnosticResult;
  connectivity: MetaDiagnosticResult;
}> {
  console.log('🔍 Starting Meta diagnostics...');

  try {
    // Test token validation
    const { data: tokenResult } = await supabase.functions.invoke('validate-meta-connection', {
      body: { testType: 'token_validation' }
    });

    // Test phone number validation
    const { data: phoneResult } = await supabase.functions.invoke('validate-meta-connection', {
      body: { testType: 'phone_number_validation' }
    });

    // Test general connectivity
    const { data: connectivityResult } = await supabase.functions.invoke('validate-meta-connection', {
      body: { testType: 'connectivity_test' }
    });

    console.log('📊 Meta diagnostics results:', {
      tokenResult,
      phoneResult,
      connectivityResult
    });

    return {
      tokenValidation: tokenResult || { success: false, message: 'No response from server' },
      phoneValidation: phoneResult || { success: false, message: 'No response from server' },
      connectivity: connectivityResult || { success: false, message: 'No response from server' }
    };
  } catch (error) {
    console.error('❌ Error running Meta diagnostics:', error);
    const errorResult = { success: false, message: 'Error running diagnostics: ' + error.message };
    return {
      tokenValidation: errorResult,
      phoneValidation: errorResult,
      connectivity: errorResult
    };
  }
}

export async function testAudioUrl(audioUrl: string): Promise<MetaDiagnosticResult> {
  console.log('🎵 Testing audio URL:', audioUrl);
  
  try {
    // First, try to fetch with CORS
    const response = await fetch(audioUrl, {
      method: 'HEAD',
      mode: 'cors'
    });

    if (response.ok) {
      return {
        success: true,
        message: 'Audio URL is accessible',
        details: {
          status: response.status,
          contentType: response.headers.get('content-type'),
          contentLength: response.headers.get('content-length')
        }
      };
    } else {
      return {
        success: false,
        message: `HTTP ${response.status}: ${response.statusText}`,
        details: { status: response.status, statusText: response.statusText }
      };
    }
  } catch (error) {
    console.error('❌ Error testing audio URL:', error);
    
    // Try to determine the specific error
    if (error.message.includes('CORS')) {
      return {
        success: false,
        message: 'CORS policy blocked the request - audio URLs from Meta require server-side proxy',
        details: { error: error.message }
      };
    } else if (error.message.includes('network')) {
      return {
        success: false,
        message: 'Network error - check internet connection',
        details: { error: error.message }
      };
    } else {
      return {
        success: false,
        message: 'Failed to access audio URL',
        details: { error: error.message }
      };
    }
  }
}
