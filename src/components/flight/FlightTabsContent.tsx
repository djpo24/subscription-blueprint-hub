
import { FlightData } from '@/types/flight';
import { TabsContent } from '@/components/ui/tabs';
import { FlightCompactDisplay } from './FlightCompactDisplay';
import { FlightDetailsTab } from './FlightDetailsTab';
import { FlightDetailedView } from './FlightDetailedView';

interface FlightTabsContentProps {
  flight: FlightData;
  isTabExpanded: boolean;
  onToggle: () => void;
  tripOrigin?: string;
  tripDestination?: string;
}

export function FlightTabsContent({ flight, isTabExpanded, onToggle, tripOrigin, tripDestination }: FlightTabsContentProps) {
  return (
    <>
      <TabsContent value="compact" className="mt-4">
        <FlightCompactDisplay flight={flight} />
      </TabsContent>
      
      <TabsContent value="new-format" className="mt-4">
        <FlightDetailsTab 
          flight={flight} 
          isExpanded={isTabExpanded}
          onToggle={onToggle}
          tripOrigin={tripOrigin}
          tripDestination={tripDestination}
        />
      </TabsContent>
      
      <TabsContent value="detailed" className="mt-4">
        <FlightDetailedView flight={flight} />
      </TabsContent>
    </>
  );
}
