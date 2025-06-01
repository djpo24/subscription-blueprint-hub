
import { FlightData } from '@/types/flight';
import { FlightDetailsHeader } from './FlightDetailsHeader';
import { FlightDetailsBody } from './FlightDetailsBody';

interface FlightDetailsTabProps {
  flight: FlightData;
  isExpanded?: boolean;
  onToggle?: () => void;
}

export function FlightDetailsTab({ flight, isExpanded = false, onToggle }: FlightDetailsTabProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      <FlightDetailsHeader 
        flight={flight} 
        isExpanded={isExpanded} 
        onToggle={onToggle} 
      />
      {isExpanded && <FlightDetailsBody flight={flight} />}
    </div>
  );
}
