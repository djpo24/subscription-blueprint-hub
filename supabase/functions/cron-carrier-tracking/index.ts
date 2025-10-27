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
    console.log('🕐 Starting carrier tracking cron job...');

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Obtener guías pendientes que necesitan actualización
    // Solo las que no se han chequeado en las últimas 3 horas o nunca
    const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();

    console.log('🔍 Looking for pending guides not checked since:', threeHoursAgo);

    const { data: guides, error: guidesError } = await supabaseClient
      .from('carrier_tracking_guides')
      .select('*')
      .eq('status', 'pending');

    console.log(`📋 Total pending guides found: ${guides?.length || 0}`);

    if (guidesError) {
      throw guidesError;
    }

    console.log(`📦 Found ${guides?.length || 0} guides to update`);

    if (!guides || guides.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No guides to update', updated: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let updatedCount = 0;
    let deliveredCount = 0;
    let errorCount = 0;

    // Procesar cada guía
    for (const guide of guides) {
      try {
        console.log(`🔍 Checking guide: ${guide.tracking_number} (${guide.carrier})`);

        // Invocar la función de tracking
        const trackingResponse = await supabaseClient.functions.invoke('track-carrier', {
          body: {
            carrier: guide.carrier,
            trackingNumber: guide.tracking_number,
            customerId: guide.customer_id,
            saveToDatabase: false
          }
        });

        if (trackingResponse.error) {
          console.error(`❌ Error tracking ${guide.tracking_number}:`, trackingResponse.error);
          errorCount++;
          continue;
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
          .eq('id', guide.id);

        if (updateError) {
          console.error(`❌ Error updating ${guide.tracking_number}:`, updateError);
          errorCount++;
          continue;
        }

        // Guardar en historial
        await supabaseClient
          .from('carrier_tracking_history')
          .insert({
            guide_id: guide.id,
            status: trackingData.status,
            tracking_data: trackingData,
          });

        updatedCount++;
        if (isDelivered) {
          deliveredCount++;
          console.log(`✅ Guide ${guide.tracking_number} marked as delivered`);
        }

      } catch (error) {
        console.error(`❌ Error processing guide ${guide.tracking_number}:`, error);
        errorCount++;
      }

      // Pequeña pausa entre consultas para no sobrecargar
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    const summary = {
      total: guides.length,
      updated: updatedCount,
      delivered: deliveredCount,
      errors: errorCount,
      timestamp: new Date().toISOString()
    };

    console.log('✅ Cron job completed:', summary);

    return new Response(
      JSON.stringify(summary),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ Cron job error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
