import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { guideId } = await req.json();

    if (!guideId) {
      throw new Error('Guide ID is required');
    }

    // Obtener la guía
    const { data: guide, error: guideError } = await supabaseClient
      .from('carrier_tracking_guides')
      .select('*')
      .eq('id', guideId)
      .single();

    if (guideError || !guide) {
      throw new Error('Guide not found');
    }

    // Si ya está entregado, no consultar más
    if (guide.status === 'delivered') {
      return new Response(
        JSON.stringify({ message: 'Guide already delivered' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('🔄 Refreshing guide:', guide.tracking_number);

    // Realizar la consulta según la transportadora
    const trackingResponse = await supabaseClient.functions.invoke('track-carrier', {
      body: {
        carrier: guide.carrier,
        trackingNumber: guide.tracking_number,
        customerId: guide.customer_id,
        saveToDatabase: false
      }
    });

    if (trackingResponse.error) {
      throw trackingResponse.error;
    }

    const trackingData = trackingResponse.data;
    const isDelivered = trackingData.status?.toLowerCase().includes('entregado');

    // Actualizar la guía
    const { error: updateError } = await supabaseClient
      .from('carrier_tracking_guides')
      .update({
        status: isDelivered ? 'delivered' : 'pending',
        last_status: trackingData.status,
        last_check_at: new Date().toISOString(),
        delivered_at: isDelivered ? new Date().toISOString() : guide.delivered_at,
        last_tracking_data: trackingData,
      })
      .eq('id', guideId);

    if (updateError) {
      throw updateError;
    }

    // Guardar en historial
    await supabaseClient
      .from('carrier_tracking_history')
      .insert({
        guide_id: guideId,
        status: trackingData.status,
        tracking_data: trackingData,
      });

    console.log('✅ Guide updated successfully');

    return new Response(
      JSON.stringify({ success: true, data: trackingData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ Error refreshing guide:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
