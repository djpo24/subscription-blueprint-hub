import { Card, CardContent } from '@/components/ui/card';
import { FlightData } from '@/types/flight';
import { FlightStatusDisplay } from './FlightStatusDisplay';
import { FlightCardHeader } from './FlightCardHeader';
interface FlightCardProps {
  flight: FlightData;
  onUpdateFlightStatus: (params: {
    flightId: string;
    hasLanded: boolean;
  }) => void;
}
export function FlightCard({
  flight,
  onUpdateFlightStatus
}: FlightCardProps) {
  return <Card className="border-l-4 border-l-500">
      <CardContent className="p-0">
        <FlightStatusDisplay flight={flight} />
        {!flight.has_landed && <div className="p-4 border-t border-gray-100">
            <FlightCardHeader flight={flight} onUpdateFlightStatus={onUpdateFlightStatus} />
          </div>}
      </CardContent>
    </Card>;
}