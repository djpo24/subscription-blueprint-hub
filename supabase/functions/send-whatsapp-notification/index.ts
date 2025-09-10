import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log('🛑 KILL STUB: send-whatsapp-notification called - REJECTING AUTO-RESPONSE');
  
  return new Response(
    JSON.stringify({ 
      error: 'Auto-response system permanently disabled',
      message: 'This function has been deactivated to prevent automatic responses',
      status: 'DISABLED'
    }),
    { 
      status: 410,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  )
})