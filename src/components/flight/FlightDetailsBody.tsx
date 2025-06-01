
import { FlightData } from '@/types/flight';
import { FlightRouteVisual } from './FlightRouteVisual';
import { FlightAirportDetails } from './FlightAirportDetails';
import { FlightDetailsFooter } from './FlightDetailsFooter';

interface FlightDetailsBodyProps {
  flight: FlightData;
}

export function FlightDetailsBody({ flight }: FlightDetailsBodyProps) {
  return (
    <div className="border-t border-gray-100 p-6">
      <FlightRouteVisual flight={flight} />
      <FlightAirportDetails flight={flight} />
      <FlightDetailsFooter flight={flight} />
    </div>
  );
}
