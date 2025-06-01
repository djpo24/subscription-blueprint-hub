
import { FlightRecord, TripRecord, FlightStatusResult } from './types.ts';

// Función para obtener la fecha actual en zona horaria de Bogotá
function getBogotaDate() {
  const now = new Date();
  const bogotaTime = new Date(now.toLocaleString("en-US", {timeZone: "America/Bogota"}));
  return bogotaTime;
}

export async function checkFlightStatusIntelligent(
  supabaseClient: any, 
  flight: FlightRecord, 
  tripDate: string
): Promise<FlightStatusResult> {
  try {
    // Llamar a la función get-flight-data con la estrategia inteligente
    const response = await supabaseClient.functions.invoke('get-flight-data', {
      body: { 
        flightNumber: flight.flight_number, 
        tripDate: tripDate,
        priority: (flight as any).priority || 1
      }
    });

    if (response.error) {
      console.log('Error en consulta inteligente, usando fallback de fecha');
      return await checkFlightStatusBasedOnDate(flight, tripDate);
    }

    const flightData = response.data;
    if (!flightData) {
      return await checkFlightStatusBasedOnDate(flight, tripDate);
    }

    // Procesar respuesta de la estrategia inteligente
    const departure = flightData.departure;
    const arrival = flightData.arrival;

    let status = 'scheduled';
    let hasLanded = false;
    let actualDeparture = departure?.actual || null;
    let actualArrival = arrival?.actual || null;

    switch (flightData.flight_status) {
      case 'landed':
      case 'arrived':
        status = 'arrived';
        hasLanded = true;
        if (!actualArrival && arrival?.scheduled) {
          actualArrival = arrival.scheduled;
        }
        break;
      case 'active':
      case 'en-route':
        status = 'in_flight';
        break;
      case 'cancelled':
        status = 'cancelled';
        break;
      case 'delayed':
        status = 'delayed';
        break;
      default:
        if (actualArrival) {
          status = 'arrived';
          hasLanded = true;
        } else if (actualDeparture) {
          status = 'in_flight';
        }
    }

    return {
      hasLanded,
      actualDeparture,
      actualArrival,
      status,
      dataSource: flightData._fallback ? 'fallback_inteligente' : 'api'
    };

  } catch (error) {
    console.error('Error en estrategia inteligente:', error);
    return await checkFlightStatusBasedOnDate(flight, tripDate);
  }
}

export async function checkFlightStatusBasedOnDate(
  flight: FlightRecord, 
  tripDate: string
): Promise<FlightStatusResult> {
  console.log(`Verificando estado del vuelo con fallback de fecha: ${flight.flight_number} para fecha: ${tripDate}`);
  
  const bogotaTime = getBogotaDate();
  const flightDate = new Date(tripDate);
  const todayBogota = new Date(bogotaTime.getFullYear(), bogotaTime.getMonth(), bogotaTime.getDate());
  const flightDateOnly = new Date(flightDate.getFullYear(), flightDate.getMonth(), flightDate.getDate());
  
  console.log('Comparación de fechas (zona horaria Bogotá):', {
    flightDate: flightDateOnly.toISOString(),
    todayBogota: todayBogota.toISOString(),
    bogotaTime: bogotaTime.toISOString(),
    isFlightBeforeToday: flightDateOnly < todayBogota,
    isFlightToday: flightDateOnly.getTime() === todayBogota.getTime()
  });

  // Si la fecha del vuelo es anterior a hoy (en zona horaria de Bogotá), definitivamente ya aterrizó
  if (flightDateOnly < todayBogota) {
    const scheduledDeparture = new Date(flight.scheduled_departure);
    const scheduledArrival = new Date(flight.scheduled_arrival);
    
    return {
      hasLanded: true,
      actualDeparture: scheduledDeparture.toISOString(),
      actualArrival: scheduledArrival.toISOString(),
      status: 'arrived',
      dataSource: 'fecha_bogota'
    };
  }
  
  // Si es hoy (en zona horaria de Bogotá), verificar la hora
  if (flightDateOnly.getTime() === todayBogota.getTime()) {
    const scheduledArrival = new Date(flight.scheduled_arrival);
    const currentTime = bogotaTime.getTime();
    
    if (currentTime >= scheduledArrival.getTime()) {
      return {
        hasLanded: true,
        actualDeparture: flight.scheduled_departure,
        actualArrival: scheduledArrival.toISOString(),
        status: 'arrived',
        dataSource: 'fecha_bogota'
      };
    }
  }
  
  // El vuelo aún no ha llegado
  return {
    hasLanded: false,
    actualDeparture: null,
    actualArrival: null,
    status: 'in_flight',
    dataSource: 'fecha_bogota'
  };
}
