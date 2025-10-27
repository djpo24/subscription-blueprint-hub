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
  
  try {
    const initialUrl = `https://www.interrapidisimo.com/sigue-tu-envio/?guia=${trackingNumber}`;
    console.log('📡 Initial URL:', initialUrl);
    
    // Timeout de 15 segundos para dar tiempo al redirect y carga
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000); // 15 segundos
    
    const response = await fetch(initialUrl, {
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'es-CO,es;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'Cache-Control': 'max-age=0',
      }
    });
    
    clearTimeout(timeout);
    
    console.log('✅ Response received:', response.status, response.url);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const html = await response.text();
    console.log('📄 HTML length:', html.length);
    
    // Búsqueda simple y rápida de estado
    let status = 'Consulta realizada';
    const events: TrackingEvent[] = [];
    
    // Buscar texto que indique estado de entrega
    if (html.toLowerCase().includes('entregado')) {
      status = 'Entregado';
    } else if (html.toLowerCase().includes('en tránsito') || html.toLowerCase().includes('en transito')) {
      status = 'En tránsito';
    } else if (html.toLowerCase().includes('despachado')) {
      status = 'Despachado';
    } else if (html.toLowerCase().includes('recibido')) {
      status = 'Recibido en bodega';
    }
    
    // Agregar evento básico
    events.push({
      date: new Date().toISOString(),
      description: status,
      location: 'Colombia'
    });
    
    console.log('✅ Tracking successful:', { status, url: response.url });
    
    return {
      carrier: 'interrapidisimo',
      trackingNumber,
      status,
      events
    };
  } catch (error) {
    console.error('⚠️ Scraping failed:', error.message);
    
    // Si el error es por timeout, dar un mensaje más específico
    const isTimeout = error.message.includes('aborted') || error.message.includes('timeout');
    
    return {
      carrier: 'interrapidisimo',
      trackingNumber,
      status: isTimeout ? 'Consulta en proceso' : 'Error temporal',
      events: [{
        date: new Date().toISOString(),
        description: isTimeout 
          ? 'El sitio de Interrapidísimo está tardando. La consulta se reintentará automáticamente en las próximas 3 horas.'
          : `Error temporal: ${error.message}. Se reintentará automáticamente.`,
        location: 'Sistema'
      }]
    };
  }
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
