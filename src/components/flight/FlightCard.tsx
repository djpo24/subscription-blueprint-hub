
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { FlightData } from '@/types/flight';
import { FlightCardHeader } from './FlightCardHeader';
import { FlightCardDetails } from './FlightCardDetails';
import { FlightCardFooter } from './FlightCardFooter';

interface FlightCardProps {
  flight: FlightData;
  onUpdateFlightStatus: (params: { flightId: string; hasLanded: boolean }) => void;
}

export function FlightCard({ flight, onUpdateFlightStatus }: FlightCardProps) {
  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardHeader className="pb-3">
        <FlightCardHeader 
          flight={flight} 
          onUpdateFlightStatus={onUpdateFlightStatus} 
        />
      </CardHeader>
      
      <CardContent className="pt-0">
        <FlightCardDetails flight={flight} />
        <FlightCardFooter flight={flight} />
      </CardContent>
    </Card>
  );
}
