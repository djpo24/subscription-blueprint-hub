
import { FlightData } from '@/types/flight';
import { FlightLastUpdated } from './FlightLastUpdated';
import { extractFlightApiData } from './FlightApiDataExtractor';
import { parseISO } from 'date-fns';

interface FlightStatusDisplayProps {
  flight: FlightData;
}

export function FlightStatusDisplay({ flight }: FlightStatusDisplayProps) {
  const {
    departureTerminal,
    departureGate,
    arrivalTerminal,
    arrivalGate,
    departureCity,
    arrivalCity,
    departureAirportApi,
    arrivalAirportApi
  } = extractFlightApiData(flight);

  // Calcular duración del vuelo
  const calculateFlightDuration = () => {
    if (!flight.scheduled_departure || !flight.scheduled_arrival) return null;
    
    try {
      const dep = parseISO(flight.scheduled_departure);
      const arr = parseISO(flight.scheduled_arrival);
      const diffHours = (arr.getTime() - dep.getTime()) / (1000 * 60 * 60);
      const hours = Math.floor(diffHours);
      const minutes = Math.round((diffHours - hours) * 60);
      return `${hours} h ${minutes} min`;
    } catch {
      return null;
    }
  };

  // Formatear hora
  const formatTime = (dateTime: string | null) => {
    if (!dateTime) return '-';
    
    try {
      const date = new Date(dateTime);
      const hours = date.getUTCHours();
      const minutes = date.getUTCMinutes();
      const ampm = hours >= 12 ? 'p. m.' : 'a. m.';
      const displayHours = hours % 12 || 12;
      return `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
    } catch {
      return dateTime;
    }
  };

  // Formatear fecha
  const formatDate = (dateTime: string | null) => {
    if (!dateTime) return '';
    
    try {
      const date = new Date(dateTime);
      const days = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
      const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
      
      const dayName = days[date.getUTCDay()];
      const day = date.getUTCDate();
      const month = months[date.getUTCMonth()];
      
      return `${dayName}, ${day} de ${month}`;
    } catch {
      return '';
    }
  };

  const duration = calculateFlightDuration();
  
  // Usar horarios reales si están disponibles
  const departureTime = flight.actual_departure || flight.scheduled_departure;
  const arrivalTime = flight.actual_arrival || flight.scheduled_arrival;
  
  // Usar ciudades reales de la API si están disponibles
  const displayDepartureLocation = departureCity || flight.departure_airport;
  const displayArrivalLocation = arrivalCity || flight.arrival_airport;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm max-w-4xl mx-auto">
      {/* Header con aeropuertos y duración */}
      <div className="flex items-center justify-between mb-8">
        <div className="text-6xl font-light text-gray-900">
          {flight.departure_airport}
        </div>
        <div className="flex-1 mx-8 relative">
          <div className="h-0.5 bg-green-500 w-full"></div>
          <div className="absolute right-0 top-0 transform -translate-y-1/2">
            <div className="text-green-600 text-2xl">✈️</div>
          </div>
          {duration && (
            <div className="text-center text-lg text-gray-600 mt-3">
              {duration}
            </div>
          )}
        </div>
        <div className="text-6xl font-light text-gray-900">
          {flight.arrival_airport}
        </div>
      </div>

      {/* Subtítulos de información del aeropuerto */}
      <div className="flex justify-between mb-6">
        <div className="text-gray-600 underline text-lg">
          Información del aeropuerto
        </div>
        <div className="text-gray-600 underline text-lg">
          Información del aeropuerto
        </div>
      </div>

      {/* Información detallada en dos columnas */}
      <div className="grid grid-cols-2 gap-12">
        {/* Columna izquierda - Salida */}
        <div>
          <div className="mb-4">
            <div className="text-2xl font-medium text-gray-900 mb-1">
              {displayDepartureLocation} · {formatDate(departureTime)}
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-lg">
            <div>
              <div className="text-gray-600 mb-2">Salió</div>
              <div className={`text-2xl font-medium ${flight.actual_departure ? 'text-green-600' : 'text-gray-900'}`}>
                {formatTime(departureTime)}
              </div>
              {flight.actual_departure && flight.scheduled_departure && (
                <div className="text-gray-500 line-through text-lg">
                  {formatTime(flight.scheduled_departure)}
                </div>
              )}
            </div>
            
            <div>
              <div className="text-gray-600 mb-2">Terminal</div>
              <div className="text-2xl font-bold text-gray-900">
                {departureTerminal || '-'}
              </div>
            </div>
            
            <div>
              <div className="text-gray-600 mb-2">Puerta</div>
              <div className="text-2xl font-bold text-gray-900">
                {departureGate || '-'}
              </div>
            </div>
          </div>
        </div>

        {/* Columna derecha - Llegada */}
        <div>
          <div className="mb-4">
            <div className="text-2xl font-medium text-gray-900 mb-1">
              {displayArrivalLocation} · {formatDate(arrivalTime)}
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-lg">
            <div>
              <div className="text-gray-600 mb-2">Llegó</div>
              <div className={`text-2xl font-medium ${flight.actual_arrival ? 'text-green-600' : 'text-gray-900'}`}>
                {formatTime(arrivalTime)}
              </div>
              {flight.actual_arrival && flight.scheduled_arrival && (
                <div className="text-gray-500 line-through text-lg">
                  {formatTime(flight.scheduled_arrival)}
                </div>
              )}
            </div>
            
            <div>
              <div className="text-gray-600 mb-2">Terminal</div>
              <div className="text-2xl font-bold text-gray-900">
                {arrivalTerminal || '-'}
              </div>
            </div>
            
            <div>
              <div className="text-gray-600 mb-2">Puerta</div>
              <div className="text-2xl font-bold text-gray-900">
                {arrivalGate || '-'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer con información de actualización y fuentes */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
        <FlightLastUpdated lastUpdated={flight.last_updated} />
        <div className="text-gray-500 text-sm">
          Fuentes: <span className="underline">OAG</span>, <span className="underline">FlightAware</span>
        </div>
      </div>
    </div>
  );
}
