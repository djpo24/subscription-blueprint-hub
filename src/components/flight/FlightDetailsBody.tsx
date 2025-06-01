
import { FlightData } from '@/types/flight';
import { FlightRouteVisual } from './FlightRouteVisual';
import { FlightAirportDetails } from './FlightAirportDetails';
import { FlightDetailsFooter } from './FlightDetailsFooter';

interface FlightDetailsBodyProps {
  flight: FlightData;
  tripOrigin?: string;
  tripDestination?: string;
}

export function FlightDetailsBody({ flight, tripOrigin, tripDestination }: FlightDetailsBodyProps) {
  return (
    <div className="border-t border-gray-100 p-6">
      <FlightRouteVisual 
        flight={flight} 
        tripOrigin={tripOrigin}
        tripDestination={tripDestination}
      />
      <FlightAirportDetails flight={flight} />
      <FlightDetailsFooter flight={flight} />
    </div>
  );
}
