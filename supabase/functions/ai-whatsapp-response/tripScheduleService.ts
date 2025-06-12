
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export interface TripSchedule {
  id: string;
  trip_date: string;
  origin: string;
  destination: string;
  flight_number?: string;
  status: string;
}

export async function getUpcomingTripsByDestination(
  supabase: any, 
  destination?: string, 
  daysAhead: number = 30
): Promise<TripSchedule[]> {
  console.log(`🗓️ [TripSchedule] Consultando viajes próximos${destination ? ` hacia ${destination}` : ''} en los próximos ${daysAhead} días`);
  
  const today = new Date();
  const futureDate = new Date();
  futureDate.setDate(today.getDate() + daysAhead);
  
  const todayStr = today.toISOString().split('T')[0];
  const futureDateStr = futureDate.toISOString().split('T')[0];
  
  let query = supabase
    .from('trips')
    .select('id, trip_date, origin, destination, flight_number, status')
    .gte('trip_date', todayStr)
    .lte('trip_date', futureDateStr)
    .in('status', ['scheduled', 'pending'])
    .order('trip_date', { ascending: true });
  
  // Filtrar por destino si se especifica
  if (destination) {
    // Búsqueda flexible que incluye variaciones del destino
    const destinationNormalized = destination.toLowerCase().trim();
    
    if (destinationNormalized.includes('curacao') || destinationNormalized.includes('curazao')) {
      query = query.ilike('destination', '%curazao%');
    } else if (destinationNormalized.includes('barranquilla') || destinationNormalized.includes('colombia')) {
      query = query.ilike('destination', '%barranquilla%');
    } else {
      query = query.ilike('destination', `%${destination}%`);
    }
  }
  
  const { data: trips, error } = await query;
  
  if (error) {
    console.error('❌ [TripSchedule] Error consultando viajes:', error);
    return [];
  }
  
  console.log(`✅ [TripSchedule] Encontrados ${trips?.length || 0} viajes próximos`);
  return trips || [];
}

export function formatTripsForPrompt(trips: TripSchedule[], requestedDestination?: string): string {
  if (!trips || trips.length === 0) {
    if (requestedDestination) {
      return `No hay viajes programados hacia ${requestedDestination} en los próximos 30 días.`;
    }
    return 'No hay viajes programados en los próximos 30 días.';
  }

  let tripsText = '';
  
  if (requestedDestination) {
    tripsText += `PRÓXIMOS VIAJES HACIA ${requestedDestination.toUpperCase()}:\n\n`;
  } else {
    tripsText += 'PRÓXIMOS VIAJES PROGRAMADOS:\n\n';
  }
  
  trips.forEach((trip, index) => {
    const date = new Date(trip.trip_date + 'T00:00:00');
    const formattedDate = date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    tripsText += `${index + 1}. 📅 ${formattedDate}\n`;
    tripsText += `   🛫 Ruta: ${trip.origin} → ${trip.destination}\n`;
    
    if (trip.flight_number) {
      tripsText += `   ✈️ Vuelo: ${trip.flight_number}\n`;
    }
    
    tripsText += `   📋 Estado: ${trip.status === 'scheduled' ? 'Programado' : 'Pendiente'}\n\n`;
  });

  tripsText += `
INSTRUCCIONES PARA CONSULTAS DE FECHAS DE VIAJES:
- Si el cliente pregunta por fechas de viajes sin especificar destino, pregunta hacia dónde quiere viajar
- Los destinos disponibles son: Barranquilla ↔ Curazao
- Proporciona las fechas exactas de los viajes programados
- Explica que pueden reservar espacio contactándonos con anticipación
- Si no hay viajes en las fechas solicitadas, sugiere fechas alternativas cercanas`;

  return tripsText;
}

export function shouldQueryTrips(message: string): { shouldQuery: boolean; destination?: string } {
  const messageLower = message.toLowerCase();
  
  // Palabras clave que indican consulta de fechas/viajes
  const tripKeywords = [
    'fecha', 'fechas', 'viaje', 'viajes', 'próximo', 'próximos',
    'cuándo', 'cuando', 'horario', 'horarios', 'programado', 'programados',
    'salida', 'salidas', 'vuelo', 'vuelos', 'itinerario'
  ];
  
  const hasKeyword = tripKeywords.some(keyword => messageLower.includes(keyword));
  
  if (!hasKeyword) {
    return { shouldQuery: false };
  }
  
  // Detectar destino mencionado
  let destination: string | undefined;
  
  if (messageLower.includes('curacao') || messageLower.includes('curazao')) {
    destination = 'Curazao';
  } else if (messageLower.includes('barranquilla') || messageLower.includes('colombia')) {
    destination = 'Barranquilla';
  }
  
  return { shouldQuery: true, destination };
}
