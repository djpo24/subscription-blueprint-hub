
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

  // Función helper para extraer valores seguros de objetos complejos
  const extractValue = (data: any): string | null => {
    if (!data) return null;
    if (typeof data === 'string') return data;
    if (typeof data === 'object' && data.value !== undefined) {
      return data.value === 'undefined' ? null : data.value;
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

  console.log('🔍 Valores extraídos de la API:', {
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
