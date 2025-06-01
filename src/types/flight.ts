
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
  // Nuevos campos para datos de la API
  api_departure_airport?: string;
  api_arrival_airport?: string;
  api_departure_city?: string;
  api_arrival_city?: string;
}
