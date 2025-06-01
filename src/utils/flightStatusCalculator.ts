
import { FlightApiResponse } from '@/services/flightDataService';

export interface FlightStatusResult {
  status: string;
  hasLanded: boolean;
  actualDeparture: string | null;
  actualArrival: string | null;
  scheduledDeparture: Date;
  scheduledArrival: Date;
}

export function calculateFlightStatus(
  tripDate: string,
  flightDataFromAPI: FlightApiResponse | null
): FlightStatusResult {
  const tripDateObj = new Date(tripDate);
  
  let scheduledDeparture: Date;
  let scheduledArrival: Date;
  
  if (flightDataFromAPI?.departure?.scheduled && flightDataFromAPI?.arrival?.scheduled) {
    // Usar horarios EXACTOS de la API sin conversiones
    scheduledDeparture = new Date(flightDataFromAPI.departure.scheduled);
    scheduledArrival = new Date(flightDataFromAPI.arrival.scheduled);
    console.log('📅 Usando horarios REALES de API (sin conversión):', {
      scheduled_departure: flightDataFromAPI.departure.scheduled,
      scheduled_arrival: flightDataFromAPI.arrival.scheduled
    });
  } else {
    // Usar horarios por defecto básicos
    scheduledDeparture = new Date(tripDateObj);
    scheduledDeparture.setHours(6, 0, 0, 0);
    
    scheduledArrival = new Date(tripDateObj);
    scheduledArrival.setHours(8, 0, 0, 0);
  }

  // Determinar el estado del vuelo
  const now = new Date();
  const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const flightDate = new Date(tripDateObj.getFullYear(), tripDateObj.getMonth(), tripDateObj.getDate());
  
  let status = 'scheduled';
  let hasLanded = false;
  let actualDeparture = null;
  let actualArrival = null;

  // Si tenemos datos de la estrategia inteligente, usarlos EXACTAMENTE
  if (flightDataFromAPI) {
    // Usar horarios REALES exactos de la API sin conversiones
    actualDeparture = flightDataFromAPI.departure?.actual || null;
    actualArrival = flightDataFromAPI.arrival?.actual || null;
    
    console.log('⏰ Horarios REALES de API (exactos):', {
      actual_departure: actualDeparture,
      actual_arrival: actualArrival
    });
    
    switch (flightDataFromAPI.flight_status) {
      case 'landed':
      case 'arrived':
        status = 'arrived';
        hasLanded = true;
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
    }
  } else {
    // Lógica basada en fecha como fallback final
    if (flightDate < todayDate) {
      status = 'arrived';
      hasLanded = true;
      actualDeparture = scheduledDeparture.toISOString();
      actualArrival = scheduledArrival.toISOString();
    } else if (flightDate.getTime() === todayDate.getTime()) {
      const currentHour = now.getHours();
      if (currentHour >= 8) {
        status = 'arrived';
        hasLanded = true;
        actualDeparture = scheduledDeparture.toISOString();
        actualArrival = scheduledArrival.toISOString();
      } else if (currentHour >= 6) {
        status = 'in_flight';
        actualDeparture = scheduledDeparture.toISOString();
      }
    }
  }

  console.log('Flight status calculated:', {
    flightDate: flightDate.toISOString(),
    todayDate: todayDate.toISOString(),
    status,
    hasLanded,
    actualDeparture,
    actualArrival,
    dataSource: flightDataFromAPI?._fallback ? 'fallback_inteligente' : flightDataFromAPI ? 'api' : 'fecha'
  });

  return {
    status,
    hasLanded,
    actualDeparture,
    actualArrival,
    scheduledDeparture,
    scheduledArrival
  };
}
