
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
    'BCN': 'Barcelona'
  };

  // Determinar nombres a mostrar con múltiples respaldos
  const getDepartureDisplayName = () => {
    if (departureCity) return departureCity;
    if (departureAirportApi) return departureAirportApi;
    if (airportCityMap[flight.departure_airport]) return airportCityMap[flight.departure_airport];
    return flight.departure_airport; // Como último recurso, mostrar el código
  };

  const getArrivalDisplayName = () => {
    if (arrivalCity) return arrivalCity;
    if (arrivalAirportApi) return arrivalAirportApi;
    if (airportCityMap[flight.arrival_airport]) return airportCityMap[flight.arrival_airport];
    return flight.arrival_airport; // Como último recurso, mostrar el código
  };

  const departureDisplayName = getDepartureDisplayName();
  const arrivalDisplayName = getArrivalDisplayName();

  console.log('FlightRouteVisual - Datos para mostrar:', {
    departureDisplayName,
    arrivalDisplayName,
    departureCode: flight.departure_airport,
    arrivalCode: flight.arrival_airport,
    duration,
    departureCity,
    arrivalCity,
    departureAirportApi,
    arrivalAirportApi
  });

  return (
    <div className="mb-6 bg-gray-50 p-4 rounded-lg">
      {/* Títulos de ciudades con línea y avión */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-lg font-semibold text-gray-900 text-center min-w-[100px]">
          {departureDisplayName}
        </div>
        <div className="flex-1 mx-4 relative flex items-center">
          <div className="h-1 bg-blue-500 w-full rounded"></div>
          <div className="absolute right-0 transform translate-x-1/2">
            <Plane className="h-6 w-6 text-blue-600 rotate-90" />
          </div>
        </div>
        <div className="text-lg font-semibold text-gray-900 text-center min-w-[100px]">
          {arrivalDisplayName}
        </div>
      </div>

      {/* Códigos de aeropuertos con duración */}
      <div className="flex items-center justify-between">
        <div className="text-2xl font-bold text-blue-600 text-center min-w-[100px]">
          {flight.departure_airport}
        </div>
        <div className="flex-1 mx-4 relative flex items-center justify-center">
          <div className="h-0.5 bg-green-500 w-full"></div>
          {duration && (
            <div className="absolute top-2 bg-white px-2 py-1 rounded shadow-sm border text-sm text-gray-600 font-medium">
              {duration}
            </div>
          )}
        </div>
        <div className="text-2xl font-bold text-blue-600 text-center min-w-[100px]">
          {flight.arrival_airport}
        </div>
      </div>
    </div>
  );
}
