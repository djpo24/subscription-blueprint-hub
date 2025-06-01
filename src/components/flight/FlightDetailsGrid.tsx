
import { FlightInfoHeader } from './FlightInfoHeader';
import { FlightDepartureSection } from './FlightDepartureSection';
import { FlightArrivalSection } from './FlightArrivalSection';

interface FlightDetailsGridProps {
  departureAirport: string;
  arrivalAirport: string;
  departureTime: string | null;
  arrivalTime: string | null;
  departureDate: string | null;
  arrivalDate: string | null;
  actualDeparture: string | null;
  actualArrival: string | null;
  scheduledDeparture: string | null;
  scheduledArrival: string | null;
  lastUpdated: string;
  apiDepartureCity?: string;
  apiArrivalCity?: string;
  apiDepartureAirport?: string;
  apiArrivalAirport?: string;
  apiDepartureGate?: string;
  apiArrivalGate?: string;
  apiDepartureTerminal?: string;
  apiArrivalTerminal?: string;
  apiDepartureIata?: string;
  apiArrivalIata?: string;
  apiAirlineName?: string;
  apiAircraftRegistration?: string;
  apiFlightStatus?: string;
}

export function FlightDetailsGrid({
  departureAirport,
  arrivalAirport,
  departureTime,
  arrivalTime,
  departureDate,
  arrivalDate,
  actualDeparture,
  actualArrival,
  scheduledDeparture,
  scheduledArrival,
  lastUpdated,
  apiDepartureCity,
  apiArrivalCity,
  apiDepartureAirport,
  apiArrivalAirport,
  apiDepartureGate,
  apiArrivalGate,
  apiDepartureTerminal,
  apiArrivalTerminal,
  apiDepartureIata,
  apiArrivalIata,
  apiAirlineName,
  apiAircraftRegistration,
  apiFlightStatus
}: FlightDetailsGridProps) {
  console.log('FlightDetailsGrid - TODOS los datos de la API:', {
    apiDepartureCity,
    apiArrivalCity,
    apiDepartureIata,
    apiArrivalIata,
    apiDepartureGate,
    apiArrivalGate,
    apiDepartureTerminal,
    apiArrivalTerminal,
    apiAirlineName,
    apiAircraftRegistration,
    apiFlightStatus
  });

  return (
    <div className="space-y-6">
      <FlightInfoHeader
        apiFlightStatus={apiFlightStatus}
        apiAirlineName={apiAirlineName}
        apiAircraftRegistration={apiAircraftRegistration}
      />

      <div className="grid grid-cols-2 gap-6">
        <FlightDepartureSection
          departureDate={departureDate}
          actualDeparture={actualDeparture}
          departureTime={departureTime}
          scheduledDeparture={scheduledDeparture}
          lastUpdated={lastUpdated}
        />

        <FlightArrivalSection
          arrivalDate={arrivalDate}
          actualArrival={actualArrival}
          arrivalTime={arrivalTime}
          scheduledArrival={scheduledArrival}
          lastUpdated={lastUpdated}
        />
      </div>
    </div>
  );
}
