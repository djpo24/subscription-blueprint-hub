import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TrackingEvent {
  date: string;
  description: string;
  location?: string;
}

interface TrackingResponse {
  carrier: string;
  trackingNumber: string;
  status: string;
  events: TrackingEvent[];
  error?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { carrier, trackingNumber, customerId, saveToDatabase } = await req.json();

    console.log('📦 Tracking request:', { carrier, trackingNumber, customerId, saveToDatabase });

    if (!carrier || !trackingNumber) {
      throw new Error('Carrier and tracking number are required');
    }

    let response: TrackingResponse;

    switch (carrier) {
      case 'interrapidisimo':
        response = await trackInterrapidisimo(trackingNumber);
        break;
      case 'servientrega':
        response = await trackServientrega(trackingNumber);
        break;
      case 'envia':
        response = await trackEnvia(trackingNumber);
        break;
      case 'deprisa':
        response = await trackDeprisa(trackingNumber);
        break;
      case 'coordinadora':
        response = await trackCoordinadora(trackingNumber);
        break;
      default:
        throw new Error(`Unsupported carrier: ${carrier}`);
    }

    // Guardar en la base de datos si se solicita
    if (saveToDatabase && customerId) {
      const authHeader = req.headers.get('Authorization')!;
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? '',
        { global: { headers: { Authorization: authHeader } } }
      );

      const isDelivered = response.status?.toLowerCase().includes('entregado');
      
      const { error: dbError } = await supabaseClient
        .from('carrier_tracking_guides')
        .upsert({
          customer_id: customerId,
          carrier,
          tracking_number: trackingNumber,
          status: isDelivered ? 'delivered' : 'pending',
          last_status: response.status,
          last_check_at: new Date().toISOString(),
          delivered_at: isDelivered ? new Date().toISOString() : null,
          last_tracking_data: response,
        }, {
          onConflict: 'carrier,tracking_number'
        });

      if (dbError) {
        console.error('Error saving to database:', dbError);
      } else {
        console.log('✅ Guide saved to database');
      }
    }

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('❌ Error tracking carrier:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        carrier: '',
        trackingNumber: '',
        status: 'error',
        events: []
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

async function trackInterrapidisimo(trackingNumber: string): Promise<TrackingResponse> {
  console.log('🔍 Tracking Interrapidisimo:', trackingNumber);
  
  // TODO: Implementar integración real con Interrapidísimo
  // Por ahora retornamos datos de ejemplo
  return {
    carrier: 'interrapidisimo',
    trackingNumber,
    status: 'En tránsito',
    events: [
      {
        date: new Date().toISOString(),
        description: 'Paquete en tránsito',
        location: 'Bogotá'
      },
      {
        date: new Date(Date.now() - 86400000).toISOString(),
        description: 'Paquete recibido en centro de distribución',
        location: 'Medellín'
      }
    ]
  };
}

async function trackServientrega(trackingNumber: string): Promise<TrackingResponse> {
  console.log('🔍 Tracking Servientrega:', trackingNumber);
  
  // TODO: Implementar integración real con Servientrega
  return {
    carrier: 'servientrega',
    trackingNumber,
    status: 'Pendiente de consulta',
    events: [
      {
        date: new Date().toISOString(),
        description: 'Consulta pendiente - API en desarrollo',
        location: 'Colombia'
      }
    ]
  };
}

async function trackEnvia(trackingNumber: string): Promise<TrackingResponse> {
  console.log('🔍 Tracking Envía:', trackingNumber);
  
  // TODO: Implementar integración real con Envía
  return {
    carrier: 'envia',
    trackingNumber,
    status: 'Pendiente de consulta',
    events: [
      {
        date: new Date().toISOString(),
        description: 'Consulta pendiente - API en desarrollo',
        location: 'Colombia'
      }
    ]
  };
}

async function trackDeprisa(trackingNumber: string): Promise<TrackingResponse> {
  console.log('🔍 Tracking Deprisa:', trackingNumber);
  
  // TODO: Implementar integración real con Deprisa
  return {
    carrier: 'deprisa',
    trackingNumber,
    status: 'Pendiente de consulta',
    events: [
      {
        date: new Date().toISOString(),
        description: 'Consulta pendiente - API en desarrollo',
        location: 'Colombia'
      }
    ]
  };
}

async function trackCoordinadora(trackingNumber: string): Promise<TrackingResponse> {
  console.log('🔍 Tracking Coordinadora:', trackingNumber);
  
  // TODO: Implementar integración real con Coordinadora
  return {
    carrier: 'coordinadora',
    trackingNumber,
    status: 'Pendiente de consulta',
    events: [
      {
        date: new Date().toISOString(),
        description: 'Consulta pendiente - API en desarrollo',
        location: 'Colombia'
      }
    ]
  };
}
