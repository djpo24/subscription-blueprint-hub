
import { FlightData } from '@/types/flight';
import { FlightStatusBadge } from './FlightStatusBadge';
import { FlightLastUpdated } from './FlightLastUpdated';

interface FlightStatusHeaderProps {
  flight: FlightData;
}

export function FlightStatusHeader({ flight }: FlightStatusHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-semibold">
          Vuelo {flight.flight_number.toUpperCase()}
        </h2>
        <FlightStatusBadge 
          status={flight.api_flight_status || flight.status} 
          hasLanded={flight.has_landed}
        />
      </div>
      <FlightLastUpdated lastUpdated={flight.last_updated} />
    </div>
  );
}
