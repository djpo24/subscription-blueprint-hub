
import { Badge } from '@/components/ui/badge';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { FlightData } from '@/types/flight';

interface FlightStatusDisplayProps {
  flight: FlightData;
}

export function FlightStatusDisplay({ flight }: FlightStatusDisplayProps) {
  const getStatusConfig = (status: string, hasLanded: boolean) => {
    if (hasLanded || status === 'arrived') {
      return {
        label: 'LLEGÓ',
        bgColor: 'bg-green-100',
        textColor: 'text-green-800',
        borderColor: 'border-green-300'
      };
    }
    
    switch (status) {
      case 'in_flight':
        return {
          label: 'EN VUELO',
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-800',
          borderColor: 'border-blue-300'
        };
      case 'delayed':
        return {
          label: 'RETRASADO',
          bgColor: 'bg-red-100',
          textColor: 'text-red-800',
          borderColor: 'border-red-300'
        };
      case 'scheduled':
        return {
          label: 'PROGRAMADO',
          bgColor: 'bg-yellow-100',
          textColor: 'text-yellow-800',
          borderColor: 'border-yellow-300'
        };
      case 'cancelled':
        return {
          label: 'CANCELADO',
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800',
          borderColor: 'border-gray-300'
        };
      default:
        return {
          label: 'PROGRAMADO',
          bgColor: 'bg-yellow-100',
          textColor: 'text-yellow-800',
          borderColor: 'border-yellow-300'
        };
    }
  };

  const formatTime = (dateTime: string | null) => {
    if (!dateTime) return '-';
    try {
      return format(parseISO(dateTime), 'h:mm a', { locale: es });
    } catch {
      return '-';
    }
  };

  const formatDate = (dateTime: string | null) => {
    if (!dateTime) return '-';
    try {
      const date = parseISO(dateTime);
      return format(date, 'EEE, dd \'de\' MMM', { locale: es });
    } catch {
      return '-';
    }
  };

  const statusConfig = getStatusConfig(flight.status, flight.has_landed);
  
  // Mostrar hora real si está disponible, sino la programada
  const departureTime = flight.actual_departure || flight.scheduled_departure;
  const arrivalTime = flight.actual_arrival || flight.scheduled_arrival;

  // Para las fechas, usar las fechas programadas principalmente
  const departureDate = flight.scheduled_departure || flight.actual_departure;
  const arrivalDate = flight.scheduled_arrival || flight.actual_arrival;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      {/* Header con hora y destino */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            {formatTime(arrivalTime)}
          </span>
          <span className="text-sm text-gray-600">
            a {flight.arrival_airport}
          </span>
        </div>
        <Badge 
          className={`${statusConfig.bgColor} ${statusConfig.textColor} ${statusConfig.borderColor} border font-medium px-3 py-1`}
        >
          {statusConfig.label}
        </Badge>
      </div>

      {/* Número de vuelo */}
      <div className="mb-6">
        <span className="text-2xl font-bold text-gray-900">
          {flight.airline} {flight.flight_number}
        </span>
      </div>

      {/* Ruta con línea de conexión */}
      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="text-3xl font-bold text-gray-900">
            {flight.departure_airport}
          </div>
          <div className="flex-1 mx-4 relative">
            <div className="h-0.5 bg-green-500 w-full"></div>
            <div className="absolute right-0 top-0 transform -translate-y-1/2">
              <div className="text-green-600">✈️</div>
            </div>
            <div className="text-center text-sm text-gray-600 mt-2">
              {/* Calcular duración si tenemos ambas fechas */}
              {flight.scheduled_departure && flight.scheduled_arrival && (
                (() => {
                  const dep = parseISO(flight.scheduled_departure);
                  const arr = parseISO(flight.scheduled_arrival);
                  const diffHours = Math.round((arr.getTime() - dep.getTime()) / (1000 * 60 * 60));
                  const hours = Math.floor(diffHours);
                  const minutes = Math.round((diffHours - hours) * 60);
                  return `${hours} h ${minutes} min`;
                })()
              )}
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {flight.arrival_airport}
          </div>
        </div>

        {/* Información detallada */}
        <div className="grid grid-cols-2 gap-4">
          {/* Salida */}
          <div>
            <div className="text-sm text-gray-500 mb-1">
              Información del aeropuerto
            </div>
            <div className="font-medium">
              {flight.departure_airport} · {formatDate(departureDate)}
            </div>
            <div className="text-sm text-gray-600">
              {flight.actual_departure ? 'Salió' : 'Salida'}
            </div>
            <div className={`text-2xl font-bold ${flight.actual_departure ? 'text-green-600' : 'text-gray-900'}`}>
              {formatTime(departureTime)}
            </div>
            {flight.scheduled_departure && flight.actual_departure && flight.scheduled_departure !== flight.actual_departure && (
              <div className="text-sm text-gray-500 line-through">
                {formatTime(flight.scheduled_departure)}
              </div>
            )}
          </div>

          {/* Llegada */}
          <div>
            <div className="text-sm text-gray-500 mb-1">
              Información del aeropuerto
            </div>
            <div className="font-medium">
              {flight.arrival_airport} · {formatDate(arrivalDate)}
            </div>
            <div className="text-sm text-gray-600">
              {flight.actual_arrival ? 'Llegó' : 'Llegada'}
            </div>
            <div className={`text-2xl font-bold ${flight.actual_arrival ? 'text-green-600' : 'text-gray-900'}`}>
              {formatTime(arrivalTime)}
            </div>
            {flight.scheduled_arrival && flight.actual_arrival && flight.scheduled_arrival !== flight.actual_arrival && (
              <div className="text-sm text-gray-500 line-through">
                {formatTime(flight.scheduled_arrival)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer con última actualización */}
      <div className="text-xs text-gray-500 text-center">
        Se actualizó hace {(() => {
          const now = new Date();
          const lastUpdate = parseISO(flight.last_updated);
          const diffMinutes = Math.round((now.getTime() - lastUpdate.getTime()) / (1000 * 60));
          
          if (diffMinutes < 60) {
            return `${diffMinutes} min`;
          } else {
            const hours = Math.floor(diffMinutes / 60);
            const minutes = diffMinutes % 60;
            return `${hours} h ${minutes} min`;
          }
        })()}
      </div>
    </div>
  );
}
