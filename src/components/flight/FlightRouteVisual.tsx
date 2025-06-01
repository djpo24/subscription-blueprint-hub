
import { Plane } from 'lucide-react';
import { FlightData } from '@/types/flight';
import { extractFlightApiData } from './FlightApiDataExtractor';

interface FlightRouteVisualProps {
  flight: FlightData;
}

export function FlightRouteVisual({ flight }: FlightRouteVisualProps) {
  const { departureCity, arrivalCity, departureAirportApi, arrivalAirportApi } = extractFlightApiData(flight);

  // Usar horarios reales de la API cuando estén disponibles
  const departureTime = flight.actual_departure || flight.scheduled_departure;
  const arrivalTime = flight.actual_arrival || flight.scheduled_arrival;

  // Calcular duración del vuelo
  const calculateFlightDuration = () => {
    if (!departureTime || !arrivalTime) return null;
    try {
      const dep = new Date(departureTime);
      const arr = new Date(arrivalTime);
      const diffMinutes = Math.round((arr.getTime() - dep.getTime()) / (1000 * 60));
      const hours = Math.floor(diffMinutes / 60);
      const minutes = diffMinutes % 60;
      return `${hours}h ${minutes}min`;
    } catch {
      return null;
    }
  };

  const duration = calculateFlightDuration();

  // Mapeo de códigos de aeropuerto a ciudades comunes (como respaldo)
  const airportCityMap: { [key: string]: string } = {
    'BOG': 'Bogotá',
    'MDE': 'Medellín',
    'CLO': 'Cali',
    'BAQ': 'Barranquilla',
    'CTG': 'Cartagena',
    'BGA': 'Bucaramanga',
    'PEI': 'Pereira',
    'ADZ': 'San Andrés',
    'LET': 'Leticia',
    'MIA': 'Miami',
    'LAX': 'Los Ángeles',
    'JFK': 'Nueva York',
    'MAD': 'Madrid',
    'BCN': 'Barcelona',
    'CUR': 'Curazao'
  };

  // Determinar nombres a mostrar con múltiples respaldos - SIEMPRE mostrar algo
  const getDepartureDisplayName = () => {
    if (departureCity) return departureCity;
    if (departureAirportApi) return departureAirportApi;
    if (airportCityMap[flight.departure_airport]) return airportCityMap[flight.departure_airport];
    return flight.departure_airport;
  };

  const getArrivalDisplayName = () => {
    if (arrivalCity) return arrivalCity;
    if (arrivalAirportApi) return arrivalAirportApi;
    if (airportCityMap[flight.arrival_airport]) return airportCityMap[flight.arrival_airport];
    return flight.arrival_airport;
  };

  const departureDisplayName = getDepartureDisplayName();
  const arrivalDisplayName = getArrivalDisplayName();

  console.log('FlightRouteVisual - DEBUGGING COMPLETO:', {
    flight_number: flight.flight_number,
    departure_airport: flight.departure_airport,
    arrival_airport: flight.arrival_airport,
    departureCity,
    arrivalCity,
    departureAirportApi,
    arrivalAirportApi,
    departureDisplayName,
    arrivalDisplayName,
    duration,
    will_show_departure: departureDisplayName || 'NADA',
    will_show_arrival: arrivalDisplayName || 'NADA'
  });

  return (
    <div className="mb-6 bg-gray-50 p-6 rounded-lg">
      {/* Título de la ruta */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Ruta del Vuelo</h3>
      </div>

      {/* Visualización de la ruta con ciudades y línea */}
      <div className="flex items-center justify-between mb-4">
        {/* Ciudad de origen */}
        <div className="text-center min-w-[120px]">
          <div className="text-xl font-bold text-blue-600 mb-1">
            {departureDisplayName}
          </div>
          <div className="text-sm text-gray-600">
            {flight.departure_airport}
          </div>
        </div>

        {/* Línea conectora con avión */}
        <div className="flex-1 mx-6 relative flex items-center">
          <div className="h-1 bg-blue-500 w-full rounded relative">
            {/* Avión en el centro */}
            <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-full p-1">
              <Plane className="h-5 w-5 text-blue-600 rotate-90" />
            </div>
          </div>
          {/* Duración del vuelo */}
          {duration && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white px-2 py-1 rounded shadow-sm border text-xs text-gray-600 font-medium whitespace-nowrap">
              {duration}
            </div>
          )}
        </div>

        {/* Ciudad de destino */}
        <div className="text-center min-w-[120px]">
          <div className="text-xl font-bold text-blue-600 mb-1">
            {arrivalDisplayName}
          </div>
          <div className="text-sm text-gray-600">
            {flight.arrival_airport}
          </div>
        </div>
      </div>

      {/* Información adicional de horarios */}
      <div className="flex items-center justify-between text-sm text-gray-600 pt-3 border-t border-gray-200">
        <div>
          <span className="font-medium">Salida:</span> {departureTime ? new Date(departureTime).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : '-'}
        </div>
        <div>
          <span className="font-medium">Llegada:</span> {arrivalTime ? new Date(arrivalTime).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : '-'}
        </div>
      </div>
    </div>
  );
}
