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
    const url = `https://www.interrapidisimo.com/sigue-tu-envio/?guia=${trackingNumber}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const html = await response.text();
    
    // Extraer el estado principal
    const statusMatch = html.match(/<div[^>]*class="[^"]*estado[^"]*"[^>]*>(.*?)<\/div>/i);
    const status = statusMatch ? statusMatch[1].trim().replace(/<[^>]+>/g, '') : 'Consulta realizada';
    
    // Extraer eventos/novelas del tracking
    const events: TrackingEvent[] = [];
    const tableRegex = /<tr[^>]*>[\s\S]*?<td[^>]*>([\d\/\s:]+)<\/td>[\s\S]*?<td[^>]*>(.*?)<\/td>[\s\S]*?<td[^>]*>(.*?)<\/td>[\s\S]*?<\/tr>/gi;
    let match;
    
    while ((match = tableRegex.exec(html)) !== null) {
      const dateStr = match[1].trim();
      const description = match[2].trim().replace(/<[^>]+>/g, '');
      const location = match[3].trim().replace(/<[^>]+>/g, '');
      
      if (dateStr && description) {
        // Convertir fecha de formato DD/MM/YYYY HH:MM:SS a ISO
        const [datePart, timePart] = dateStr.split(' ');
        const [day, month, year] = datePart.split('/');
        const isoDate = `${year}-${month}-${day}T${timePart || '00:00:00'}`;
        
        events.push({
          date: isoDate,
          description,
          location: location || undefined
        });
      }
    }
    
    // Si no hay eventos en tabla, buscar información alternativa
    if (events.length === 0) {
      const infoMatch = html.match(/<div[^>]*class="[^"]*info-guia[^"]*"[^>]*>(.*?)<\/div>/is);
      if (infoMatch) {
        events.push({
          date: new Date().toISOString(),
          description: status,
          location: 'Colombia'
        });
      }
    }
    
    console.log('✅ Interrapidisimo tracking successful:', { status, eventsCount: events.length });
    
    return {
      carrier: 'interrapidisimo',
      trackingNumber,
      status,
      events: events.length > 0 ? events : [{
        date: new Date().toISOString(),
        description: 'Información de seguimiento consultada',
        location: 'Colombia'
      }]
    };
  } catch (error) {
    console.error('❌ Error tracking Interrapidisimo:', error);
    return {
      carrier: 'interrapidisimo',
      trackingNumber,
      status: 'Error en consulta',
      events: [{
        date: new Date().toISOString(),
        description: `Error al consultar: ${error.message}`,
        location: 'Colombia'
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
