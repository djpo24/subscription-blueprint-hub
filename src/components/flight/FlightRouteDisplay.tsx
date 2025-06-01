
import { parseISO } from 'date-fns';

interface FlightRouteDisplayProps {
  departureAirport: string;
  arrivalAirport: string;
  scheduledDeparture: string | null;
  scheduledArrival: string | null;
  apiDepartureCity?: string;
  apiArrivalCity?: string;
  apiDepartureIata?: string;
  apiArrivalIata?: string;
}

export function FlightRouteDisplay({ 
  departureAirport, 
  arrivalAirport, 
  scheduledDeparture, 
  scheduledArrival,
  apiDepartureCity,
  apiArrivalCity,
  apiDepartureIata,
  apiArrivalIata
}: FlightRouteDisplayProps) {
  const calculateFlightDuration = () => {
    if (!scheduledDeparture || !scheduledArrival) return null;
    
    try {
      const dep = parseISO(scheduledDeparture);
      const arr = parseISO(scheduledArrival);
      const diffHours = Math.round((arr.getTime() - dep.getTime()) / (1000 * 60 * 60));
      const hours = Math.floor(diffHours);
      const minutes = Math.round((diffHours - hours) * 60);
      return `${hours}h ${minutes}m`;
    } catch {
      return null;
    }
  };

  const duration = calculateFlightDuration();

  // Usar códigos IATA si están disponibles, sino usar nombres de ciudades/aeropuertos
  const displayDeparture = apiDepartureIata || apiDepartureCity || departureAirport;
  const displayArrival = apiArrivalIata || apiArrivalCity || arrivalAirport;
  
  // Para mostrar información adicional
  const departureDetail = apiDepartureCity && apiDepartureCity !== apiDepartureIata ? apiDepartureCity : null;
  const arrivalDetail = apiArrivalCity && apiArrivalCity !== apiArrivalIata ? apiArrivalCity : null;

  console.log('FlightRouteDisplay - Datos de ruta completos:', {
    departureAirport,
    arrivalAirport,
    apiDepartureCity,
    apiArrivalCity,
    apiDepartureIata,
    apiArrivalIata,
    displayDeparture,
    displayArrival,
    departureDetail,
    arrivalDetail
  });

  return (
    <div className="flex items-center justify-between mb-4">
      <div className="text-center">
        <div className="text-3xl font-bold text-gray-900">
          {displayDeparture}
        </div>
        {departureDetail && (
          <div className="text-sm text-gray-600 mt-1">
            {departureDetail}
          </div>
        )}
      </div>
      
      <div className="flex-1 mx-4 relative">
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
      
      <div className="text-center">
        <div className="text-3xl font-bold text-gray-900">
          {displayArrival}
        </div>
        {arrivalDetail && (
          <div className="text-sm text-gray-600 mt-1">
            {arrivalDetail}
          </div>
        )}
      </div>
    </div>
  );
}
