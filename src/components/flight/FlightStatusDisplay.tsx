
import { FlightData } from '@/types/flight';
import { extractFlightApiData } from './FlightApiDataExtractor';

interface FlightStatusDisplayProps {
  flight: FlightData;
}

export function FlightStatusDisplay({ flight }: FlightStatusDisplayProps) {
  const {
    departureCity,
    arrivalCity,
    departureTerminal,
    departureGate,
    arrivalTerminal,
    arrivalGate
  } = extractFlightApiData(flight);

  // Usar horarios reales cuando estén disponibles
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

  const duration = calculateFlightDuration();

  // Obtener nombres de ciudades o aeropuertos
  const departureLocation = departureCity || flight.departure_airport;
  const arrivalLocation = arrivalCity || flight.arrival_airport;

  // Estado del vuelo
  const getFlightStatus = () => {
    if (flight.has_landed || flight.status === 'arrived') {
      return { label: 'LLEGÓ', color: 'bg-green-100 text-green-800 border border-green-300' };
    }
    if (flight.status === 'in_flight') {
      return { label: 'EN VUELO', color: 'bg-blue-100 text-blue-800 border border-blue-300' };
    }
    if (flight.status === 'delayed') {
      return { label: 'RETRASADO', color: 'bg-red-100 text-red-800 border border-red-300' };
    }
    return { label: 'PROGRAMADO', color: 'bg-yellow-100 text-yellow-800 border border-yellow-300' };
  };

  const flightStatus = getFlightStatus();

  // Verificar si hay retrasos
  const hasDelayedDeparture = flight.actual_departure && flight.scheduled_departure && 
    new Date(flight.actual_departure).getTime() > new Date(flight.scheduled_departure).getTime();
  
  const hasDelayedArrival = flight.actual_arrival && flight.scheduled_arrival && 
    new Date(flight.actual_arrival).getTime() > new Date(flight.scheduled_arrival).getTime();

  console.log('FlightStatusDisplay datos del vuelo:', {
    flight_number: flight.flight_number,
    scheduled_departure: flight.scheduled_departure,
    scheduled_arrival: flight.scheduled_arrival,
    actual_departure: flight.actual_departure,
    actual_arrival: flight.actual_arrival,
    status: flight.status,
    has_landed: flight.has_landed,
    airline: flight.airline,
    last_updated: flight.last_updated
  });

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex items-center gap-6">
          <div>
            <div className="text-xl font-medium text-gray-900">
              {formatTime(arrivalTime)} p. m.
            </div>
            <div className="text-lg font-medium text-gray-900 mt-1">
              {flight.flight_number.toUpperCase()}
            </div>
          </div>
          <div className="text-lg text-gray-700">
            a {arrivalLocation} ({flight.arrival_airport})
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className={`px-3 py-1 rounded-md text-sm font-medium ${flightStatus.color}`}>
            {flightStatus.label}
          </div>
          <button className="text-gray-400 hover:text-gray-600">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="p-6">
        {/* Ruta con duración */}
        <div className="mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="text-6xl font-light text-gray-900">{flight.departure_airport}</div>
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
            <div className="text-6xl font-light text-gray-900">{flight.arrival_airport}</div>
          </div>
        </div>

        {/* Información detallada */}
        <div className="grid grid-cols-2 gap-8">
          {/* Información de salida */}
          <div>
            <div className="text-gray-600 text-sm underline mb-4 font-medium">
              Información del aeropuerto
            </div>
            <div className="space-y-3">
              <div className="text-xl font-medium text-gray-900">
                {departureLocation} · {formatDate(departureTime)}
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-gray-600 text-sm mb-1">Salió</div>
                  <div className="text-2xl font-medium text-green-600">
                    {formatTime(departureTime)} p. m.
                  </div>
                  {hasDelayedDeparture && (
                    <div className="text-gray-500 line-through text-sm mt-1">
                      {formatTime(flight.scheduled_departure)} p. m.
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
                {arrivalLocation} · {formatDate(arrivalTime)}
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-gray-600 text-sm mb-1">Llegó</div>
                  <div className="text-2xl font-medium text-green-600">
                    {formatTime(arrivalTime)} p. m.
                  </div>
                  {hasDelayedArrival && (
                    <div className="text-gray-500 line-through text-sm mt-1">
                      {formatTime(flight.scheduled_arrival)} p. m.
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
        <div className="mt-8 pt-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
          <div>Se actualizó hace 6 h 5 min</div>
          <div className="flex items-center gap-1">
            Fuentes: 
            <span className="underline ml-1">OAG</span>, 
            <span className="underline ml-1">FlightAware</span>
          </div>
          <button className="text-gray-400 hover:text-gray-600">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
