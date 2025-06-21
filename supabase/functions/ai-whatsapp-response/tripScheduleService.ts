
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
  console.log(`🗓️ [TripSchedule] Consultando envíos próximos${destination ? ` hacia ${destination}` : ''} en los próximos ${daysAhead} días`);
  
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
  
  // Filtrar por destino si se especifica - LÓGICA MEJORADA
  if (destination) {
    const destinationNormalized = destination.toLowerCase().trim();
    
    // Buscar viajes QUE VAYAN HACIA el destino solicitado
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
    console.error('❌ [TripSchedule] Error consultando envíos:', error);
    return [];
  }
  
  console.log(`✅ [TripSchedule] Encontrados ${trips?.length || 0} envíos próximos hacia ${destination || 'todos los destinos'}`);
  return trips || [];
}

export function formatTripsForPrompt(trips: TripSchedule[], requestedDestination?: string): string {
  if (!trips || trips.length === 0) {
    if (requestedDestination) {
      return `❌ No hay envíos de encomiendas programados hacia ${requestedDestination} en los próximos 30 días.`;
    }
    return '❌ No hay envíos de encomiendas programados en los próximos 30 días.';
  }

  let tripsText = '';
  
  if (requestedDestination) {
    tripsText += `✈️ **PRÓXIMOS ENVÍOS DE ENCOMIENDAS HACIA ${requestedDestination.toUpperCase()}:**\n\n`;
  } else {
    tripsText += '✈️ **PRÓXIMOS ENVÍOS DE ENCOMIENDAS PROGRAMADOS:**\n\n';
  }
  
  trips.forEach((trip, index) => {
    const date = new Date(trip.trip_date + 'T00:00:00');
    const formattedDate = date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    tripsText += `${index + 1}. 📅 **${formattedDate}**\n`;
    tripsText += `   🎯 **Destino del envío:** ${trip.destination}\n`;
    tripsText += `   ✈️ **Salida desde:** ${trip.origin}\n`;
    
    if (trip.flight_number) {
      tripsText += `   ✈️ **Vuelo:** ${trip.flight_number}\n`;
    }
    
    const statusIcon = trip.status === 'scheduled' ? '✅' : '⏳';
    const statusText = trip.status === 'scheduled' ? 'Programado' : 'Pendiente';
    tripsText += `   ${statusIcon} **Estado:** ${statusText}\n\n`;
  });

  tripsText += `
📋 **INSTRUCCIONES INTELIGENTES PARA RESPUESTAS DE FECHAS DE ENVÍO:**

🔍 **ANÁLISIS PREVIO OBLIGATORIO:**
- ANTES de responder, analizar si el destino solicitado coincide con el destino de los viajes encontrados
- VERIFICAR que la ruta mostrada sea coherente con lo solicitado por el cliente
- NUNCA mostrar rutas contradictorias (ejemplo: cliente pide envío a Curazao, no mostrar "Curazao → Barranquilla")
- Si el cliente pregunta SIN especificar destino, OBLIGATORIO preguntar destino primero

📝 **FORMATO DE RESPUESTA INTELIGENTE CON EMOJIS:**
- Si el cliente pregunta por envíos hacia Curazao: mostrar SOLO viajes con destino Curazao 🇨🇼
- Si el cliente pregunta por envíos hacia Barranquilla: mostrar SOLO viajes con destino Barranquilla 🇨🇴
- SIEMPRE verificar coherencia entre pregunta del cliente y respuesta
- Usar emojis específicos: 📅 para fechas, ✈️ para vuelos, 🎯 para destinos, ✈️ para origen

💬 **REGLAS DE COMUNICACIÓN INTELIGENTE:**
- Si pregunta "¿cuándo viajan?" SIN destino → OBLIGATORIO preguntar destino
- NO mencionar que no somos agencia de viajes (el cliente ya lo sabe)
- NO hacer recordatorios innecesarios sobre el tipo de empresa
- Responder de forma directa y clara con emojis apropiados
- Mantener coherencia entre la pregunta y la respuesta
- Usar el branding: "✈️ Envíos Ojito - Conectando Barranquilla y Curazao"

✅ **EJEMPLO CORRECTO - SIN DESTINO:**
Cliente: "¿Cuándo viajan?"
Respuesta: "¡Hola! 👋 Para mostrarte las fechas de los próximos viajes, necesito saber el destino. 🎯

📍 **¿Hacia dónde quieres enviar?**

• 🇨🇼 **Curazao**
• 🇨🇴 **Barranquilla**

Escribe el destino y te muestro todas las fechas disponibles. ✈️"

✅ **EJEMPLO CORRECTO - CON DESTINO:**
Cliente: "¿Cuándo hay envío hacia Curazao?"
Respuesta: "¡Hola! 👋 El próximo envío hacia Curazao 🇨🇼 es el viernes 13 de junio 📅. ¿Quieres reservar espacio para tu encomienda? 📦"

❌ **EJEMPLO INCORRECTO:**
Cliente: "¿Cuándo hay envío hacia Curazao?"  
Respuesta: "Envío hacia Curazao: Ruta Curazao → Barranquilla" (CONTRADICTORIO)

❌ **EJEMPLO INCORRECTO:**
Cliente: "¿Cuándo viajan?"
Respuesta: Mostrar fechas sin preguntar destino (FALTA INTELIGENCIA)`;

  return tripsText;
}

export function shouldQueryTrips(message: string): { shouldQuery: boolean; destination?: string } {
  const messageLower = message.toLowerCase().trim();
  
  // MEJORADO: Palabras clave expandidas para detectar ALL las formas de preguntar sobre viajes
  const tripKeywords = [
    // Variaciones de "cuando viajan"
    'cuando viajan', 'cuándo viajan', 'cuando vuelan', 'cuándo vuelan',
    'cuando van', 'cuándo van', 'cuando va', 'cuándo va',
    'cuando se van', 'cuándo se van', 'cuando van a', 'cuándo van a',
    'cuando van a viajar', 'cuándo van a viajar', 'cuando viajan a', 'cuándo viajan a',
    'cuando se van para', 'cuándo se van para', 'cuando va para', 'cuándo va para',
    'cuando va a', 'cuándo va a', 'cuando van para', 'cuándo van para',
    
    // Palabras relacionadas con fechas y envíos
    'fecha', 'fechas', 'envío', 'envios', 'enviar', 'próximo', 'próximos',
    'cuándo', 'cuando', 'horario', 'horarios', 'programado', 'programados',
    'salida', 'salidas', 'vuelo', 'vuelos', 'itinerario', 'llevar', 'encomienda',
    'viaje', 'viajes', 'cuando sale', 'cuándo sale', 'cuando salen', 'cuándo salen',
    
    // Variaciones específicas detectadas en logs
    'cuando hay viaje', 'cuándo hay viaje', 'cuando hay envío', 'cuándo hay envío',
    'hay viaje', 'hay envío', 'próximo viaje', 'proximo viaje',
    'próximo envío', 'proximo envío'
  ];
  
  const hasKeyword = tripKeywords.some(keyword => messageLower.includes(keyword));
  
  if (!hasKeyword) {
    console.log(`🔍 [TripDetection] No se detectaron palabras clave de viaje en: "${message}"`);
    return { shouldQuery: false };
  }
  
  console.log(`✅ [TripDetection] Consulta de viaje detectada: "${message}"`);
  
  // Detectar destino mencionado con lógica mejorada
  let destination: string | undefined;
  
  // Detectar intención hacia Curazao (múltiples variaciones)
  if (messageLower.includes('curacao') || messageLower.includes('curazao') || 
      messageLower.includes('hacia curazao') || messageLower.includes('para curazao') ||
      messageLower.includes('a curazao') || messageLower.includes('de curazao')) {
    destination = 'Curazao';
    console.log(`🎯 [TripDetection] Destino detectado: ${destination}`);
  } 
  // Detectar intención hacia Barranquilla (múltiples variaciones)
  else if (messageLower.includes('barranquilla') || messageLower.includes('colombia') ||
           messageLower.includes('hacia barranquilla') || messageLower.includes('para barranquilla') ||
           messageLower.includes('a barranquilla') || messageLower.includes('de barranquilla')) {
    destination = 'Barranquilla';
    console.log(`🎯 [TripDetection] Destino detectado: ${destination}`);
  } else {
    console.log(`❓ [TripDetection] No se detectó destino específico en: "${message}"`);
  }
  
  return { shouldQuery: true, destination };
}
