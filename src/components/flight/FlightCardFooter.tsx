
import { format, parseISO } from 'date-fns';
import { FlightData } from '@/types/flight';

interface FlightCardFooterProps {
  flight: FlightData;
}

export function FlightCardFooter({ flight }: FlightCardFooterProps) {
  const formatDateTime = (dateTime: string | null) => {
    if (!dateTime) return 'No programado';
    try {
      return format(parseISO(dateTime), 'dd/MM/yyyy HH:mm');
    } catch {
      return 'Fecha inválida';
    }
  };

  return (
    <div className="mt-4 pt-4 border-t border-gray-100">
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-gray-500">Última actualización:</span>
          <div className="font-medium">
            {formatDateTime(flight.last_updated)}
          </div>
        </div>
        <div>
          <span className="text-gray-500">Notificación enviada:</span>
          <div className="font-medium">
            {flight.notification_sent ? 'Sí' : 'No'}
          </div>
        </div>
      </div>
    </div>
  );
}
