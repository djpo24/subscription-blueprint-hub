
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FlightData } from '@/types/flight';

interface FlightCardHeaderProps {
  flight: FlightData;
  onUpdateFlightStatus: (params: { flightId: string; hasLanded: boolean }) => void;
}

export function FlightCardHeader({ flight, onUpdateFlightStatus }: FlightCardHeaderProps) {
  const handleMarkAsLanded = () => {
    onUpdateFlightStatus({ flightId: flight.id, hasLanded: true });
  };

  const handleMarkAsInFlight = () => {
    onUpdateFlightStatus({ flightId: flight.id, hasLanded: false });
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant={flight.has_landed ? "default" : "secondary"}>
            {flight.has_landed ? "Aterrizado" : "En vuelo"}
          </Badge>
          <span className="text-sm text-gray-500">
            Vuelo {flight.flight_number}
          </span>
        </div>
        <Badge variant="outline" className="text-red-600 border-red-200">
          Actualizaciones Automáticas DESHABILITADAS
        </Badge>
      </div>
      
      <div className="flex gap-2">
        {!flight.has_landed ? (
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAsLanded}
            className="flex-1"
          >
            Marcar como Aterrizado
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAsInFlight}
            className="flex-1"
          >
            Marcar como En Vuelo
          </Button>
        )}
      </div>
    </div>
  );
}
