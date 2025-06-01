
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
      return `${hours} h ${minutes} min`;
    } catch {
      return null;
    }
  };

  const duration = calculateFlightDuration();
  const departureAirportName = departureCity || departureAirportApi || flight.departure_airport;
  const arrivalAirportName = arrivalCity || arrivalAirportApi || flight.arrival_airport;
  const departureCode = flight.departure_airport;
  const arrivalCode = flight.arrival_airport;

  return (
    <div className="mb-6">
      {/* Ruta de ciudades con línea y avión */}
      <div className="flex items-center justify-center mb-4">
        <div className="text-2xl font-bold text-gray-900">
          {departureAirportName}
        </div>
        <div className="flex-1 mx-6 relative">
          <div className="h-0.5 bg-blue-500 w-full"></div>
          <div className="absolute right-2 top-0 transform -translate-y-1/2">
            <Plane className="h-5 w-5 text-blue-600 rotate-90" />
          </div>
        </div>
        <div className="text-2xl font-bold text-gray-900">
          {arrivalAirportName}
        </div>
      </div>

      {/* Ruta con duración */}
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
  );
}
