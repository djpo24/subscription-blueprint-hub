
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FlightData } from '@/types/flight';

interface FlightCardHeaderProps {
  flight: FlightData;
  onUpdateFlightStatus: (params: { flightId: string; hasLanded: boolean }) => void;
}

export function FlightCardHeader({ flight, onUpdateFlightStatus }: FlightCardHeaderProps) {
  const getStatusColor = (hasLanded: boolean, notificationSent: boolean) => {
    if (notificationSent) {
      return "bg-green-100 text-green-800";
    } else if (hasLanded) {
      return "bg-yellow-100 text-yellow-800";
    }
    return "bg-blue-100 text-blue-800";
  };

  const getStatusLabel = (hasLanded: boolean, notificationSent: boolean) => {
    if (notificationSent) {
      return "Notificado";
    } else if (hasLanded) {
      return "Pendiente Notificación";
    }
    return "En Vuelo";
  };

  const getStatusIcon = (hasLanded: boolean, notificationSent: boolean) => {
    if (notificationSent) {
      return "✅";
    } else if (hasLanded) {
      return "🛬";
    }
    return "✈️";
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="text-2xl">
          {getStatusIcon(flight.has_landed, flight.notification_sent)}
        </div>
        <div>
          <h3 className="font-bold text-lg">
            {flight.airline} {flight.flight_number}
          </h3>
          <Badge className={getStatusColor(flight.has_landed, flight.notification_sent)}>
            {getStatusLabel(flight.has_landed, flight.notification_sent)}
          </Badge>
        </div>
      </div>
      {!flight.has_landed && (
        <Button 
          size="sm" 
          variant="outline"
          onClick={() => onUpdateFlightStatus({ flightId: flight.id, hasLanded: true })}
        >
          Marcar Aterrizado
        </Button>
      )}
    </div>
  );
}
