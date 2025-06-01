
interface ApiField {
  _type?: string;
  value?: string;
}

export interface ExtractedFlightData {
  departureTerminal: string | null;
  departureGate: string | null;
  arrivalTerminal: string | null;
  arrivalGate: string | null;
  departureCity: string | null;
  arrivalCity: string | null;
  departureAirportApi: string | null;
  arrivalAirportApi: string | null;
  aircraft: string | null;
  flightStatusApi: string | null;
}

// Helper function to extract value from API objects
export const getApiValue = (apiField: any): string | null => {
  if (!apiField) return null;
  if (typeof apiField === 'string') return apiField;
  if (typeof apiField === 'object' && apiField.value && apiField.value !== 'undefined') {
    return apiField.value;
  }
  return null;
};

export const extractFlightApiData = (flight: any): ExtractedFlightData => {
  const departureTerminal = getApiValue(flight.api_departure_terminal);
  const departureGate = getApiValue(flight.api_departure_gate);
  const arrivalTerminal = getApiValue(flight.api_arrival_terminal);
  const arrivalGate = getApiValue(flight.api_arrival_gate);
  const departureCity = getApiValue(flight.api_departure_city);
  const arrivalCity = getApiValue(flight.api_arrival_city);
  const departureAirportApi = getApiValue(flight.api_departure_airport);
  const arrivalAirportApi = getApiValue(flight.api_arrival_airport);
  const aircraft = getApiValue(flight.api_aircraft);
  const flightStatusApi = getApiValue(flight.api_flight_status);

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
};
