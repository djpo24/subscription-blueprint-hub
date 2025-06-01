
import { FlightData } from '@/types/flight';
import { extractFlightApiData } from './FlightApiDataExtractor';
import { calculateTimeDifference } from './FlightTimeDifferenceCalculator';

interface FlightCompactDisplayProps {
  flight: FlightData;
}

export function FlightCompactDisplay({ flight }: FlightCompactDisplayProps) {
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

  // Formatear tiempo
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

  // Nombres de aeropuertos y ciudades
  const departureAirportName = departureCity || departureAirportApi || flight.departure_airport;
  const arrivalAirportName = arrivalCity || arrivalAirportApi || flight.arrival_airport;
  const departureCode = flight.departure_airport;
  const arrivalCode = flight.arrival_airport;

  // Estado del vuelo
  const getFlightStatus = () => {
    if (flight.has_landed || flight.status === 'arrived') {
      return { label: 'LLEGÓ', color: 'bg-green-500 text-white' };
    }
    if (flight.status === 'in_flight') {
      return { label: 'EN VUELO', color: 'bg-blue-500 text-white' };
    }
    if (flight.status === 'delayed') {
      return { label: 'RETRASADO', color: 'bg-red-500 text-white' };
    }
    return { label: 'PROGRAMADO', color: 'bg-gray-500 text-white' };
  };

  const flightStatus = getFlightStatus();

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-6">
          <div className="text-left">
            <div className="text-2xl font-normal text-gray-900">
              {formatTime(arrivalTime)}
            </div>
            <div className="text-lg font-medium text-gray-900 mt-1">
              {flight.airline} {flight.flight_number}
            </div>
          </div>
          <div className="text-lg text-gray-700">
            a {arrivalAirportName} ({arrivalCode})
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className={`px-4 py-2 rounded-md text-sm font-medium ${flightStatus.color}`}>
            {flightStatus.label}
          </div>
        </div>
      </div>

      {/* Ruta principal */}
      <div className="mb-8">
        <div className="flex items-center justify-center mb-4">
          <div className="text-6xl font-light text-gray-900">{departureCode}</div>
          <div className="flex-1 mx-8 relative">
            <div className="h-1 bg-green-500 w-full rounded"></div>
            <div className="absolute right-0 top-0 transform -translate-y-1/2 translate-x-2">
              <div className="text-green-600 text-2xl">✈️</div>
            </div>
            {duration && (
              <div className="text-center text-gray-600 mt-3 font-medium">
                {duration}
              </div>
            )}
          </div>
          <div className="text-6xl font-light text-gray-900">{arrivalCode}</div>
        </div>
      </div>

      {/* Información detallada */}
      <div className="grid grid-cols-2 gap-8 border-t border-gray-100 pt-6">
        {/* Información de salida */}
        <div>
          <div className="text-gray-600 text-sm underline mb-4 font-medium">
            Información del aeropuerto
          </div>
          <div className="space-y-3">
            <div className="text-xl font-medium text-gray-900">
              {departureAirportName} · {formatDate(departureTime)}
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-gray-600 text-sm mb-1">Salió</div>
                <div className="text-2xl font-medium text-green-600">
                  {formatTime(departureTime)}
                </div>
                {departureStatus.isDelayed && (
                  <div className="text-gray-500 line-through text-sm mt-1">
                    {departureStatus.originalTime}
                  </div>
                )}
              </div>
              <div>
                <div className="text-gray-600 text-sm mb-1">Terminal</div>
                <div className="text-xl font-medium text-gray-900">
                  {departureTerminal || '-'}
                </div>
              </div>
              <div>
                <div className="text-gray-600 text-sm mb-1">Puerta</div>
                <div className="text-xl font-medium text-gray-900">
                  {departureGate || '-'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Información de llegada */}
        <div>
          <div className="text-gray-600 text-sm underline mb-4 font-medium">
            Información del aeropuerto
          </div>
          <div className="space-y-3">
            <div className="text-xl font-medium text-gray-900">
              {arrivalAirportName} · {formatDate(arrivalTime)}
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-gray-600 text-sm mb-1">{flight.has_landed ? 'Llegó' : 'Llega'}</div>
                <div className="text-2xl font-medium text-green-600">
                  {formatTime(arrivalTime)}
                </div>
                {arrivalStatus.isDelayed && (
                  <div className="text-gray-500 line-through text-sm mt-1">
                    {arrivalStatus.originalTime}
                  </div>
                )}
              </div>
              <div>
                <div className="text-gray-600 text-sm mb-1">Terminal</div>
                <div className="text-xl font-medium text-gray-900">
                  {arrivalTerminal || '-'}
                </div>
              </div>
              <div>
                <div className="text-gray-600 text-sm mb-1">Puerta</div>
                <div className="text-xl font-medium text-gray-900">
                  {arrivalGate || '-'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
        <div>Se actualizó hace {flight.last_updated ? '6 h 5 min' : 'tiempo desconocido'}</div>
        <div>Fuentes: <span className="underline">OAG</span>, <span className="underline">FlightAware</span></div>
      </div>
    </div>
  );
}
