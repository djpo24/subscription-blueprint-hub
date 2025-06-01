
import { FlightData } from '@/types/flight';

interface FlightDataIndicatorsProps {
  flight: FlightData;
  departureCity: string | null;
  arrivalCity: string | null;
  departureGate: string | null;
  arrivalGate: string | null;
}

export function FlightDataIndicators({
  flight,
  departureCity,
  arrivalCity,
  departureGate,
  arrivalGate
}: FlightDataIndicatorsProps) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      {(flight.actual_departure || flight.actual_arrival) && (
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
          Horarios REALES de API
        </span>
      )}
      {(departureCity || arrivalCity) && (
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
          Ciudades REALES de API
        </span>
      )}
      {(departureGate || arrivalGate) && (
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
          Gates de API
        </span>
      )}
    </div>
  );
}
