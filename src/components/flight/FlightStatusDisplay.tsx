
import { Card, CardContent } from '@/components/ui/card';
import { FlightData } from '@/types/flight';
import { FlightRouteDisplay } from './FlightRouteDisplay';
import { FlightDetailsGrid } from './FlightDetailsGrid';
import { FlightStatusHeader } from './FlightStatusHeader';
import { useFlightTimeFormatting } from './FlightTimeFormatter';

interface FlightStatusDisplayProps {
  flight: FlightData;
}

export function FlightStatusDisplay({ flight }: FlightStatusDisplayProps) {
  console.log('FlightStatusDisplay - Datos completos del vuelo:', flight);

  const { formatTime, formatDate } = useFlightTimeFormatting();

  const departureTime = formatTime(flight.actual_departure || flight.scheduled_departure);
  const arrivalTime = formatTime(flight.actual_arrival || flight.scheduled_arrival);
  const departureDate = formatDate(flight.actual_departure || flight.scheduled_departure);
  const arrivalDate = formatDate(flight.actual_arrival || flight.scheduled_arrival);

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6 space-y-6">
        <FlightStatusHeader flight={flight} />

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
