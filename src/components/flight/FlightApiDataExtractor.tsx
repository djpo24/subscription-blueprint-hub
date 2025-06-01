
import { FlightData } from '@/types/flight';

export function extractFlightApiData(flight: FlightData) {
  console.log('🔍 FlightApiDataExtractor - datos RAW recibidos:', {
    api_departure_terminal: flight.api_departure_terminal,
    api_departure_gate: flight.api_departure_gate,
    api_arrival_terminal: flight.api_arrival_terminal,
    api_arrival_gate: flight.api_arrival_gate,
    api_departure_city: flight.api_departure_city,
    api_arrival_city: flight.api_arrival_city,
    api_departure_airport: flight.api_departure_airport,
    api_arrival_airport: flight.api_arrival_airport,
    api_aircraft: flight.api_aircraft,
    api_flight_status: flight.api_flight_status
  });

  // Función helper mejorada para extraer valores seguros de objetos complejos
  const extractValue = (data: any): string | null => {
    console.log('🔧 extractValue procesando:', data);
    
    if (!data) return null;
    if (typeof data === 'string') return data;
    
    // Manejar objetos con propiedad 'value'
    if (typeof data === 'object') {
      if (data.value !== undefined && data.value !== null && data.value !== 'undefined') {
        console.log('✅ Valor extraído de objeto:', data.value);
        return String(data.value);
      }
      // Si es un objeto pero no tiene 'value', intentar convertir a string
      if (Object.keys(data).length > 0) {
        const stringified = JSON.stringify(data);
        console.log('⚠️ Objeto sin valor claro, stringificado:', stringified);
        return stringified;
      }
    }
    
    // Cualquier otro tipo, convertir a string
    if (data !== null && data !== undefined) {
      console.log('🔄 Convirtiendo a string:', data);
      return String(data);
    }
    
    return null;
  };

  const departureTerminal = extractValue(flight.api_departure_terminal);
  const departureGate = extractValue(flight.api_departure_gate);
  const arrivalTerminal = extractValue(flight.api_arrival_terminal);
  const arrivalGate = extractValue(flight.api_arrival_gate);
  const departureCity = extractValue(flight.api_departure_city);
  const arrivalCity = extractValue(flight.api_arrival_city);
  const departureAirportApi = extractValue(flight.api_departure_airport);
  const arrivalAirportApi = extractValue(flight.api_arrival_airport);
  const aircraft = extractValue(flight.api_aircraft);
  const flightStatusApi = extractValue(flight.api_flight_status);

  console.log('🔍 Valores extraídos de la API (DESPUÉS de extractValue):', {
    departureTerminal,
    departureGate,
    arrivalTerminal,
    arrivalGate,
    departureCity,
    arrivalCity,
    departureAirportApi,
    arrivalAirportApi,
    aircraft,
    flightStatusApi
  });

  return {
    departureTerminal,
    departureGate,
    arrivalTerminal,
    arrivalGate,
    departureCity,
    arrivalCity,
    departureAirportApi,
    arrivalAirportApi,
    aircraft,
    flightStatusApi
  };
}
