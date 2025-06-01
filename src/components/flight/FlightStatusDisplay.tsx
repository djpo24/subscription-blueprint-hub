
import { Card, CardContent } from '@/components/ui/card';
import { FlightData } from '@/types/flight';
import { FlightRouteDisplay } from './FlightRouteDisplay';
import { FlightDetailsGrid } from './FlightDetailsGrid';
import { FlightStatusBadge } from './FlightStatusBadge';
import { FlightLastUpdated } from './FlightLastUpdated';
import { format, parseISO } from 'date-fns';

interface FlightStatusDisplayProps {
  flight: FlightData;
}

export function FlightStatusDisplay({ flight }: FlightStatusDisplayProps) {
  console.log('FlightStatusDisplay - Datos completos del vuelo:', flight);

  const formatTime = (dateTime: string | null) => {
    if (!dateTime) return null;
    try {
      return format(parseISO(dateTime), 'HH:mm');
    } catch {
      return null;
    }
  };

  const formatDate = (dateTime: string | null) => {
    if (!dateTime) return null;
    try {
      return format(parseISO(dateTime), 'yyyy-MM-dd');
    } catch {
      return null;
    }
  };

  const departureTime = formatTime(flight.actual_departure || flight.scheduled_departure);
  const arrivalTime = formatTime(flight.actual_arrival || flight.scheduled_arrival);
  const departureDate = formatDate(flight.actual_departure || flight.scheduled_departure);
  const arrivalDate = formatDate(flight.actual_arrival || flight.scheduled_arrival);

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold">
              Vuelo {flight.flight_number.toUpperCase()}
            </h2>
            <FlightStatusBadge status={flight.api_flight_status || flight.status} />
          </div>
          <FlightLastUpdated lastUpdated={flight.last_updated} />
        </div>

        <FlightRouteDisplay
          departureAirport={flight.departure_airport}
          arrivalAirport={flight.arrival_airport}
          scheduledDeparture={flight.scheduled_departure}
          scheduledArrival={flight.scheduled_arrival}
          apiDepartureCity={flight.api_departure_city}
          apiArrivalCity={flight.api_arrival_city}
          apiDepartureIata={flight.api_departure_iata}
          apiArrivalIata={flight.api_arrival_iata}
        />

        <FlightDetailsGrid
          departureAirport={flight.departure_airport}
          arrivalAirport={flight.arrival_airport}
          departureTime={departureTime}
          arrivalTime={arrivalTime}
          departureDate={departureDate}
          arrivalDate={arrivalDate}
          actualDeparture={flight.actual_departure}
          actualArrival={flight.actual_arrival}
          scheduledDeparture={flight.scheduled_departure}
          scheduledArrival={flight.scheduled_arrival}
          apiDepartureCity={flight.api_departure_city}
          apiArrivalCity={flight.api_arrival_city}
          apiDepartureAirport={flight.api_departure_airport}
          apiArrivalAirport={flight.api_arrival_airport}
          apiDepartureGate={flight.api_departure_gate}
          apiArrivalGate={flight.api_arrival_gate}
          apiDepartureTerminal={flight.api_departure_terminal}
          apiArrivalTerminal={flight.api_arrival_terminal}
          apiDepartureIata={flight.api_departure_iata}
          apiArrivalIata={flight.api_arrival_iata}
          apiAirlineName={flight.api_airline_name}
          apiAircraftRegistration={flight.api_aircraft_registration}
          apiFlightStatus={flight.api_flight_status}
        />
      </CardContent>
    </Card>
  );
}
