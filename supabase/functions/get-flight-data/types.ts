
export interface FallbackFlightData {
  flight_status: string;
  departure: {
    scheduled: string;
    actual: string | null;
    airport: string;
  };
  arrival: {
    scheduled: string;
    actual: string | null;
    airport: string;
  };
  airline: {
    name: string;
  };
  flight: {
    iata: string;
  };
  _fallback: boolean;
  _reason: string;
}

export interface FlightApiResponse {
  data?: any[];
  error?: any;
}
