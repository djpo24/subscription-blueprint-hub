
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
  const getDepartureTimeDiff = () => {
    if (flight.actual_departure && flight.scheduled_departure) {
      return calculateTimeDifference(flight.scheduled_departure, flight.actual_departure);
    }
    return null;
  };

  const getArrivalTimeDiff = () => {
    if (flight.actual_arrival && flight.scheduled_arrival) {
      return calculateTimeDifference(flight.scheduled_arrival, flight.actual_arrival);
    }
    return null;
  };

  const departureTimeDiff = getDepartureTimeDiff();
  const arrivalTimeDiff = getArrivalTimeDiff();

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
        
        {/* Aeropuerto de salida */}
        <div className="text-lg font-semibold text-gray-900 mb-4">
          {departureAirportName} · {formatDate(flight.scheduled_departure)}
        </div>

        {/* Horarios de salida */}
        <div className="space-y-3">
          {/* Salida Programada */}
          <div>
            <div className="text-gray-600 text-sm mb-1">Salida Programada</div>
            <div className="font-semibold text-lg text-gray-900">
              {formatTime(flight.scheduled_departure)}
            </div>
          </div>

          {/* Salida Real */}
          {flight.actual_departure && (
            <div>
              <div className="text-gray-600 text-sm mb-1">Salida Real</div>
              <div className="font-semibold text-lg text-green-600">
                {formatTime(flight.actual_departure)}
              </div>
              {departureTimeDiff && departureTimeDiff.isDelay && departureTimeDiff.minutes > 5 && (
                <div className="text-red-600 text-sm font-medium">
                  +{departureTimeDiff.minutes} min retraso
                </div>
              )}
            </div>
          )}

          {/* Terminal y Puerta */}
          <div className="grid grid-cols-2 gap-4 text-sm pt-2">
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
        
        {/* Aeropuerto de llegada */}
        <div className="text-lg font-semibold text-gray-900 mb-4">
          {arrivalAirportName} · {formatDate(flight.scheduled_arrival)}
        </div>

        {/* Horarios de llegada */}
        <div className="space-y-3">
          {/* Llegada Programada */}
          <div>
            <div className="text-gray-600 text-sm mb-1">Llegada Programada</div>
            <div className="font-semibold text-lg text-gray-900">
              {formatTime(flight.scheduled_arrival)}
            </div>
          </div>

          {/* Llegada Real */}
          {flight.actual_arrival && (
            <div>
              <div className="text-gray-600 text-sm mb-1">Llegada Real</div>
              <div className="font-semibold text-lg text-green-600">
                {formatTime(flight.actual_arrival)}
              </div>
              {arrivalTimeDiff && arrivalTimeDiff.isDelay && arrivalTimeDiff.minutes > 5 && (
                <div className="text-red-600 text-sm font-medium">
                  +{arrivalTimeDiff.minutes} min retraso
                </div>
              )}
            </div>
          )}

          {/* Terminal y Puerta */}
          <div className="grid grid-cols-2 gap-4 text-sm pt-2">
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
