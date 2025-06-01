
export interface FlightRecord {
  id: string;
  flight_number: string;
  departure_airport: string;
  arrival_airport: string;
  scheduled_departure: string;
  scheduled_arrival: string;
  actual_departure: string | null;
  actual_arrival: string | null;
  status: string;
  has_landed: boolean;
  notification_sent: boolean;
  airline: string;
  last_updated: string;
  created_at: string;
}

export interface TripRecord {
  id: string;
  origin: string;
  destination: string;
  trip_date: string;
  flight_number: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface FlightWithPriority extends FlightRecord {
  packageCount: number;
  priority: number;
}

export interface FlightStatusResult {
  hasLanded: boolean;
  actualDeparture: string | null;
  actualArrival: string | null;
  status: string;
  dataSource: string;
}

export interface MonitoringResult {
  success: boolean;
  monitored: number;
  updated: number;
  updatedFlights: string[];
  totalFlightsInDb: number;
  dailyApiUsage: number;
  maxDailyQueries: number;
}
