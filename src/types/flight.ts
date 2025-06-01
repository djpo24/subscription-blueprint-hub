
export interface FlightData {
  id: string;
  flight_number: string;
  status: string;
  actual_arrival: string | null;
  has_landed: boolean;
  notification_sent: boolean;
  departure_airport: string;
  arrival_airport: string;
  scheduled_departure: string | null;
  scheduled_arrival: string | null;
  actual_departure: string | null;
  airline: string;
  last_updated: string;
  created_at: string;
  
  // Campos adicionales de la API
  api_departure_city?: string | null;
  api_arrival_city?: string | null;
  api_departure_airport?: string | null;
  api_arrival_airport?: string | null;
  api_departure_gate?: string | null;
  api_arrival_gate?: string | null;
  api_departure_terminal?: string | null;
  api_arrival_terminal?: string | null;
  api_aircraft?: string | null;
  api_flight_status?: string | null;
  api_departure_iata?: string | null;
  api_arrival_iata?: string | null;
  api_departure_icao?: string | null;
  api_arrival_icao?: string | null;
  api_departure_timezone?: string | null;
  api_arrival_timezone?: string | null;
  api_airline_name?: string | null;
  api_airline_iata?: string | null;
  api_airline_icao?: string | null;
  api_aircraft_iata?: string | null;
  api_aircraft_registration?: string | null;
  api_raw_data?: any;
}
