
import { parseISO } from 'date-fns';

interface FlightRouteDisplayProps {
  departureAirport: string;
  arrivalAirport: string;
  scheduledDeparture: string | null;
  scheduledArrival: string | null;
}

export function FlightRouteDisplay({ 
  departureAirport, 
  arrivalAirport, 
  scheduledDeparture, 
  scheduledArrival 
}: FlightRouteDisplayProps) {
  const calculateFlightDuration = () => {
    if (!scheduledDeparture || !scheduledArrival) return null;
    
    try {
      const dep = parseISO(scheduledDeparture);
      const arr = parseISO(scheduledArrival);
      const diffHours = Math.round((arr.getTime() - dep.getTime()) / (1000 * 60 * 60));
      const hours = Math.floor(diffHours);
      const minutes = Math.round((diffHours - hours) * 60);
      return `${hours} h ${minutes} min`;
    } catch {
      return null;
    }
  };

  const duration = calculateFlightDuration();

  return (
    <div className="flex items-center justify-between mb-4">
      <div className="text-3xl font-bold text-gray-900">
        {departureAirport}
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
      <div className="text-3xl font-bold text-gray-900">
        {arrivalAirport}
      </div>
    </div>
  );
}
