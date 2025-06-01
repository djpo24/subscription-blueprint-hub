
import { FlightData } from '@/types/flight';
import { FlightStatusBadge } from './FlightStatusBadge';
import { FlightTerminalGateInfo } from './FlightTerminalGateInfo';

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
      <div className="flex gap-4">
        <FlightTerminalGateInfo 
          gate={flight.api_departure_gate} 
          terminal={flight.api_departure_terminal}
        />
        <FlightTerminalGateInfo 
          gate={flight.api_arrival_gate} 
          terminal={flight.api_arrival_terminal}
        />
      </div>
    </div>
  );
}
