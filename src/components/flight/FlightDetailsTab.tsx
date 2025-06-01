
import { FlightData } from '@/types/flight';
import { extractFlightApiData } from './FlightApiDataExtractor';
import { calculateTimeDifference } from './FlightTimeDifferenceCalculator';
import { ChevronUp } from 'lucide-react';

interface FlightDetailsTabProps {
  flight: FlightData;
  isExpanded?: boolean;
  onToggle?: () => void;
}

export function FlightDetailsTab({ flight, isExpanded = false, onToggle }: FlightDetailsTabProps) {
  const {
    departureCity,
    arrivalCity,
    departureAirportApi,
    arrivalAirportApi,
    departureTerminal,
    departureGate,
    arrivalTerminal,
    arrivalGate
  } = extractFlightApiData(flight);

  // Usar horarios reales de la API cuando estén disponibles
  const departureTime = flight.actual_departure || flight.scheduled_departure;
  const arrivalTime = flight.actual_arrival || flight.scheduled_arrival;

  // Formatear tiempo sin conversiones de zona horaria
  const formatTime = (dateTime: string | null) => {
    if (!dateTime) return '-';
    try {
      const date = new Date(dateTime);
      const hours = date.getUTCHours().toString().padStart(2, '0');
      const minutes = date.getUTCMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    } catch {
      return dateTime.substring(11, 16) || dateTime;
    }
  };

  // Formatear fecha
  const formatDate = (dateTime: string | null) => {
    if (!dateTime) return '-';
    try {
      const date = new Date(dateTime);
      const days = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
      const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
      
      const dayName = days[date.getUTCDay()];
      const day = date.getUTCDate();
      const monthName = months[date.getUTCMonth()];
      
      return `${dayName}, ${day} de ${monthName}`;
    } catch {
      return dateTime.substring(0, 10);
    }
  };

  // Calcular duración del vuelo
  const calculateFlightDuration = () => {
    if (!departureTime || !arrivalTime) return null;
    try {
      const dep = new Date(departureTime);
      const arr = new Date(arrivalTime);
      const diffMinutes = Math.round((arr.getTime() - dep.getTime()) / (1000 * 60));
      const hours = Math.floor(diffMinutes / 60);
      const minutes = diffMinutes % 60;
      return `${hours} h ${minutes} min`;
    } catch {
      return null;
    }
  };

  // Determinar si hay retrasos
  const getDepartureStatus = () => {
    if (flight.actual_departure && flight.scheduled_departure) {
      const timeDiff = calculateTimeDifference(flight.scheduled_departure, flight.actual_departure);
      if (timeDiff && timeDiff.isDelay && timeDiff.minutes > 5) {
        return {
          isDelayed: true,
          originalTime: formatTime(flight.scheduled_departure)
        };
      }
    }
    return { isDelayed: false };
  };

  const getArrivalStatus = () => {
    if (flight.actual_arrival && flight.scheduled_arrival) {
      const timeDiff = calculateTimeDifference(flight.scheduled_arrival, flight.actual_arrival);
      if (timeDiff && timeDiff.isDelay && timeDiff.minutes > 5) {
        return {
          isDelayed: true,
          originalTime: formatTime(flight.scheduled_arrival)
        };
      }
    }
    return { isDelayed: false };
  };

  const departureStatus = getDepartureStatus();
  const arrivalStatus = getArrivalStatus();
  const duration = calculateFlightDuration();

  // Nombres de aeropuertos (usar API data si está disponible)
  const departureAirportName = departureCity || departureAirportApi || flight.departure_airport;
  const arrivalAirportName = arrivalCity || arrivalAirportApi || flight.arrival_airport;

  // Códigos de aeropuerto
  const departureCode = flight.departure_airport;
  const arrivalCode = flight.arrival_airport;

  // Estado del vuelo
  const getFlightStatus = () => {
    if (flight.has_landed || flight.status === 'arrived') {
      return { label: 'LLEGÓ', color: 'bg-green-100 text-green-800 border-green-300' };
    }
    if (flight.status === 'in_flight') {
      return { label: 'EN VUELO', color: 'bg-blue-100 text-blue-800 border-blue-300' };
    }
    if (flight.status === 'delayed') {
      return { label: 'RETRASADO', color: 'bg-red-100 text-red-800 border-red-300' };
    }
    return { label: 'PROGRAMADO', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' };
  };

  const flightStatus = getFlightStatus();

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      {/* Header con información principal */}
      <div className="p-4 cursor-pointer" onClick={onToggle}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <div className="text-lg font-semibold text-gray-900">
                {formatTime(arrivalTime)}
              </div>
              <div className="text-sm font-medium text-gray-900">
                {flight.airline} {flight.flight_number}
              </div>
            </div>
            <div className="text-sm text-gray-600">
              a {arrivalAirportName} ({arrivalCode})
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className={`px-3 py-1 rounded-full border text-sm font-medium ${flightStatus.color}`}>
              {flightStatus.label}
            </div>
            <ChevronUp className={`h-5 w-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
          </div>
        </div>
      </div>

      {/* Contenido expandido */}
      {isExpanded && (
        <div className="border-t border-gray-100 p-6">
          {/* Ruta con duración */}
          <div className="mb-6">
            <div className="flex items-center justify-center mb-2">
              <div className="text-3xl font-bold text-gray-900">{departureCode}</div>
              <div className="flex-1 mx-6 relative">
                <div className="h-0.5 bg-green-500 w-full"></div>
                <div className="absolute right-0 top-0 transform -translate-y-1/2">
                  <div className="text-green-600">✈️</div>
                </div>
                {duration && (
                  <div className="text-center text-sm text-gray-600 mt-2">
                    {duration}
                  </div>
                )}
              </div>
              <div className="text-3xl font-bold text-gray-900">{arrivalCode}</div>
            </div>
          </div>

          {/* Información detallada de aeropuertos */}
          <div className="grid grid-cols-2 gap-8">
            {/* Información de salida */}
            <div>
              <div className="text-sm text-gray-600 underline mb-3">
                Información del aeropuerto
              </div>
              <div className="space-y-2">
                <div className="text-lg font-semibold text-gray-900">
                  {departureAirportName} · {formatDate(departureTime)}
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-gray-600">Salió</div>
                    <div className="font-semibold text-lg text-green-600">
                      {formatTime(departureTime)}
                    </div>
                    {departureStatus.isDelayed && (
                      <div className="text-gray-500 line-through text-sm">
                        {departureStatus.originalTime}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="text-gray-600">Terminal</div>
                    <div className="font-semibold">
                      {departureTerminal || '-'}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-600">Puerta</div>
                    <div className="font-semibold">
                      {departureGate || '-'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Información de llegada */}
            <div>
              <div className="text-sm text-gray-600 underline mb-3">
                Información del aeropuerto
              </div>
              <div className="space-y-2">
                <div className="text-lg font-semibold text-gray-900">
                  {arrivalAirportName} · {formatDate(arrivalTime)}
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-gray-600">{flight.has_landed ? 'Llegó' : 'Llega'}</div>
                    <div className="font-semibold text-lg text-green-600">
                      {formatTime(arrivalTime)}
                    </div>
                    {arrivalStatus.isDelayed && (
                      <div className="text-gray-500 line-through text-sm">
                        {arrivalStatus.originalTime}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="text-gray-600">Terminal</div>
                    <div className="font-semibold">
                      {arrivalTerminal || '-'}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-600">Puerta</div>
                    <div className="font-semibold">
                      {arrivalGate || '-'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer con fuentes */}
          <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <div>Se actualizó hace {flight.last_updated ? '6 h 5 min' : 'tiempo desconocido'}</div>
            <div>Fuentes: API FlightAware, Aviación Stack</div>
          </div>
        </div>
      )}
    </div>
  );
}
