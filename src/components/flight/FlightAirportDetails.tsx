
import { FlightData } from '@/types/flight';
import { extractFlightApiData } from './FlightApiDataExtractor';
import { calculateTimeDifference } from './FlightTimeDifferenceCalculator';

interface FlightAirportDetailsProps {
  flight: FlightData;
}

export function FlightAirportDetails({ flight }: FlightAirportDetailsProps) {
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

  // Nombres de aeropuertos (usar API data si está disponible)
  const departureAirportName = departureCity || departureAirportApi || flight.departure_airport;
  const arrivalAirportName = arrivalCity || arrivalAirportApi || flight.arrival_airport;

  return (
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
  );
}
