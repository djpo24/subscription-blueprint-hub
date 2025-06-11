
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { token } = await req.json();
    
    if (!token || typeof token !== 'string' || token.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Token is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Validate token format (basic validation)
    if (!token.startsWith('EAA') || token.length < 50) {
      return new Response(
        JSON.stringify({ error: 'El formato del token no parece válido' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Updating META_WHATSAPP_TOKEN...');

    // Test the token by making a simple API call to Meta
    const testResponse = await fetch(`https://graph.facebook.com/v19.0/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!testResponse.ok) {
      const errorData = await testResponse.text();
      console.error('Token validation failed:', errorData);
      return new Response(
        JSON.stringify({ error: 'El token proporcionado no es válido o ha expirado' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Token validated successfully');

    // Create a Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Use the new app_secrets table
    try {
      console.log('Storing token in app_secrets table...');
      
      const { error: updateError } = await supabase.rpc('update_app_secret', {
        secret_name: 'META_WHATSAPP_TOKEN',
        secret_value: token.trim()
      });

      if (updateError) {
        console.error('Error updating secret via RPC:', updateError);
        
        // Fallback: Direct table insert/update
        const { error: tableError } = await supabase
          .from('app_secrets')
          .upsert({
            name: 'META_WHATSAPP_TOKEN',
            value: token.trim(),
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'name'
          });

        if (tableError) {
          console.error('Error updating secret via table:', tableError);
          return new Response(
            JSON.stringify({ error: 'Error al guardar el token en la base de datos' }),
            { 
              status: 500, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }

        console.log('Token stored successfully via direct table access');
      } else {
        console.log('Token updated successfully via RPC function');
      }

    } catch (error) {
      console.error('Error storing token:', error);
      return new Response(
        JSON.stringify({ error: 'Error interno al guardar el token' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Token actualizado correctamente' }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in update-meta-token function:', error);
    return new Response(
      JSON.stringify({ error: 'Error interno del servidor' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
