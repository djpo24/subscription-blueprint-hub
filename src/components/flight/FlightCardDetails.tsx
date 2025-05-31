
import { Clock, MapPin, Calendar, Plane } from 'lucide-react';
import { format } from 'date-fns';
import { FlightData } from '@/types/flight';

interface FlightCardDetailsProps {
  flight: FlightData;
}

export function FlightCardDetails({ flight }: FlightCardDetailsProps) {
  const formatDateTime = (dateTime: string | null) => {
    if (!dateTime) return 'No programado';
    try {
      return format(new Date(dateTime), 'dd/MM/yyyy HH:mm');
    } catch {
      return 'Fecha inválida';
    }
  };

  const getDelayStatus = (scheduled: string | null, actual: string | null) => {
    if (!scheduled || !actual) return null;
    
    const scheduledTime = new Date(scheduled);
    const actualTime = new Date(actual);
    const diffMinutes = Math.round((actualTime.getTime() - scheduledTime.getTime()) / (1000 * 60));
    
    if (diffMinutes > 30) {
      return { status: 'delayed', minutes: diffMinutes, color: 'text-red-600' };
    } else if (diffMinutes < -15) {
      return { status: 'early', minutes: Math.abs(diffMinutes), color: 'text-green-600' };
    }
    return { status: 'on-time', minutes: diffMinutes, color: 'text-blue-600' };
  };

  const delayInfo = getDelayStatus(flight.scheduled_arrival, flight.actual_arrival);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Ruta */}
      <div className="flex items-center gap-2">
        <MapPin className="h-4 w-4 text-gray-500" />
        <div>
          <div className="text-sm text-gray-500">Ruta</div>
          <div className="font-medium">
            {flight.departure_airport} → {flight.arrival_airport}
          </div>
        </div>
      </div>

      {/* Salida Programada */}
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4 text-gray-500" />
        <div>
          <div className="text-sm text-gray-500">Salida Programada</div>
          <div className="font-medium">
            {formatDateTime(flight.scheduled_departure)}
          </div>
        </div>
      </div>

      {/* Llegada Programada */}
      <div className="flex items-center gap-2">
        <Clock className="h-4 w-4 text-gray-500" />
        <div>
          <div className="text-sm text-gray-500">Llegada Programada</div>
          <div className="font-medium">
            {formatDateTime(flight.scheduled_arrival)}
          </div>
        </div>
      </div>

      {/* Salida Real */}
      {flight.actual_departure && (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-green-500" />
          <div>
            <div className="text-sm text-gray-500">Salida Real</div>
            <div className="font-medium text-green-600">
              {formatDateTime(flight.actual_departure)}
            </div>
          </div>
        </div>
      )}

      {/* Llegada Real */}
      {flight.actual_arrival && (
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-green-500" />
          <div>
            <div className="text-sm text-gray-500">Llegada Real</div>
            <div className="font-medium text-green-600">
              {formatDateTime(flight.actual_arrival)}
            </div>
            {delayInfo && (
              <div className={`text-xs ${delayInfo.color}`}>
                {delayInfo.status === 'delayed' && `+${delayInfo.minutes} min retraso`}
                {delayInfo.status === 'early' && `-${delayInfo.minutes} min adelanto`}
                {delayInfo.status === 'on-time' && 'A tiempo'}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Estado del Vuelo */}
      <div className="flex items-center gap-2">
        <Plane className="h-4 w-4 text-gray-500" />
        <div>
          <div className="text-sm text-gray-500">Estado</div>
          <div className="font-medium capitalize">
            {flight.status === 'scheduled' && 'Programado'}
            {flight.status === 'in_flight' && 'En Vuelo'}
            {flight.status === 'arrived' && 'Llegado'}
            {flight.status === 'delayed' && 'Retrasado'}
            {flight.status === 'cancelled' && 'Cancelado'}
          </div>
        </div>
      </div>
    </div>
  );
}
