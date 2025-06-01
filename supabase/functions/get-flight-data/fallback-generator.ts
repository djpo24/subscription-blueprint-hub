
import { getBogotaDate } from './date-utils.ts';
import type { FallbackFlightData } from './types.ts';

export async function generateFallbackData(flightNumber: string, tripDate: string): Promise<FallbackFlightData> {
  const bogotaTime = getBogotaDate();
  const flightDate = new Date(tripDate);
  const todayBogota = new Date(bogotaTime.getFullYear(), bogotaTime.getMonth(), bogotaTime.getDate());
  const flightDateOnly = new Date(flightDate.getFullYear(), flightDate.getMonth(), flightDate.getDate());
  
  // Generar horarios realistas basados en el número de vuelo
  const flightNum = parseInt(flightNumber.replace(/\D/g, '')) || 100;
  const baseHour = 6 + (flightNum % 12); // Entre 6 AM y 6 PM
  const baseMinutes = (flightNum % 4) * 15; // 0, 15, 30, 45 minutos
  
  const scheduledDeparture = new Date(flightDate);
  scheduledDeparture.setHours(baseHour, baseMinutes, 0, 0);
  
  const scheduledArrival = new Date(scheduledDeparture);
  scheduledArrival.setHours(scheduledArrival.getHours() + 2); // 2 horas de vuelo
  
  let status = 'scheduled';
  let actualDeparture = null;
  let actualArrival = null;
  
  // Lógica de estado basada en fecha y hora (usando zona horaria de Bogotá)
  if (flightDateOnly < todayBogota) {
    status = 'landed';
    actualDeparture = scheduledDeparture.toISOString();
    actualArrival = scheduledArrival.toISOString();
  } else if (flightDateOnly.getTime() === todayBogota.getTime()) {
    const currentTime = bogotaTime.getTime();
    if (currentTime >= scheduledArrival.getTime()) {
      status = 'landed';
      actualDeparture = scheduledDeparture.toISOString();
      actualArrival = scheduledArrival.toISOString();
    } else if (currentTime >= scheduledDeparture.getTime()) {
      status = 'active';
      actualDeparture = scheduledDeparture.toISOString();
    }
  }
  
  return {
    flight_status: status,
    departure: {
      scheduled: scheduledDeparture.toISOString(),
      actual: actualDeparture,
      airport: 'BOG' // Default para Bogotá
    },
    arrival: {
      scheduled: scheduledArrival.toISOString(),
      actual: actualArrival,
      airport: 'MDE' // Default para Medellín
    },
    airline: {
      name: 'Avianca'
    },
    flight: {
      iata: flightNumber
    },
    _fallback: true, // Indicador de que son datos de fallback
    _reason: 'date_based_fallback'
  };
}
