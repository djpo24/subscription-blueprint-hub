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
    // Paso 1: Hacer la petición inicial que causará el redirect
    const initialUrl = `https://www.interrapidisimo.com/sigue-tu-envio/?guia=${trackingNumber}`;
    console.log('📡 Initial URL:', initialUrl);
    
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    
    const response = await fetch(initialUrl, {
      signal: controller.signal,
      redirect: 'follow', // Seguir redirects automáticamente
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'es-CO,es;q=0.9,en;q=0.8',
      }
    });
    
    clearTimeout(timeout);
    
    console.log('✅ Final URL after redirect:', response.url);
    console.log('✅ Response status:', response.status);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const html = await response.text();
    console.log('📄 HTML length:', html.length);
    
    // Buscar información en el HTML
    let status = 'Consulta realizada';
    const events: TrackingEvent[] = [];
    
    // Intentar extraer el estado principal
    const statusMatches = [
      html.match(/<div[^>]*class="[^"]*estado[^"]*"[^>]*>(.*?)<\/div>/i),
      html.match(/<span[^>]*class="[^"]*status[^"]*"[^>]*>(.*?)<\/span>/i),
      html.match(/<h2[^>]*>(.*?entregado.*?)<\/h2>/i),
      html.match(/<p[^>]*class="[^"]*tracking-status[^"]*"[^>]*>(.*?)<\/p>/i)
    ];
    
    for (const match of statusMatches) {
      if (match && match[1]) {
        status = match[1].trim().replace(/<[^>]+>/g, '');
        if (status.length > 0) break;
      }
    }
    
    // Extraer eventos de una tabla (formato común en sistemas de tracking)
    const tableRegex = /<tr[^>]*>[\s\S]*?<td[^>]*>([\d\/\s:\-]+)<\/td>[\s\S]*?<td[^>]*>(.*?)<\/td>[\s\S]*?<td[^>]*>(.*?)<\/td>[\s\S]*?<\/tr>/gi;
    let match;
    
    while ((match = tableRegex.exec(html)) !== null && events.length < 20) {
      const dateStr = match[1].trim();
      const description = match[2].trim().replace(/<[^>]+>/g, '').trim();
      const location = match[3].trim().replace(/<[^>]+>/g, '').trim();
      
      if (dateStr && description && description.length > 3) {
        try {
          // Intentar parsear la fecha
          let isoDate = new Date().toISOString();
          if (dateStr.includes('/')) {
            const [datePart, timePart] = dateStr.split(' ');
            const [day, month, year] = datePart.split('/');
            isoDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${timePart || '00:00:00'}`;
          }
          
          events.push({
            date: isoDate,
            description,
            location: location || undefined
          });
        } catch (e) {
          console.error('Error parsing date:', e);
        }
      }
    }
    
    // Si no hay eventos, agregar uno básico
    if (events.length === 0) {
      events.push({
        date: new Date().toISOString(),
        description: status,
        location: 'Colombia'
      });
    }
    
    console.log('✅ Interrapidisimo tracking successful:', { 
      status, 
      eventsCount: events.length,
      finalUrl: response.url 
    });
    
    return {
      carrier: 'interrapidisimo',
      trackingNumber,
      status,
      events
    };
  } catch (error) {
    console.error('❌ Error tracking Interrapidisimo:', error);
    
    const errorMessage = error.name === 'AbortError' 
      ? 'Tiempo de espera agotado (20s)'
      : `Error: ${error.message}`;
    
    return {
      carrier: 'interrapidisimo',
      trackingNumber,
      status: 'Error en consulta',
      events: [{
        date: new Date().toISOString(),
        description: errorMessage,
        location: 'Colombia'
      }],
      error: errorMessage
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
