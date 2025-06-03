
import { CalendarView } from '@/components/CalendarView';
import { PackagesByDateView } from '@/components/PackagesByDateView';
import { TripsWithFlightsView } from '@/components/TripsWithFlightsView';
import { TabsContent } from '@/components/ui/tabs';

interface TripsTabProps {
  viewingPackagesByDate: Date | null;
  trips: any[];
  tripsLoading: boolean;
  onAddPackage: (tripId: string) => void;
  onCreateTrip: (date: Date) => void;
  onViewPackagesByDate: (date: Date) => void;
  onBack: () => void;
  disableChat?: boolean;
  previewRole?: 'admin' | 'employee' | 'traveler';
}

export function TripsTab({
  viewingPackagesByDate,
  trips,
  tripsLoading,
  onAddPackage,
  onCreateTrip,
  onViewPackagesByDate,
  onBack,
  disableChat = false,
  previewRole
}: TripsTabProps) {
  return (
    <TabsContent value="trips" className="space-y-4 sm:space-y-8 px-2 sm:px-0">
      {viewingPackagesByDate ? (
        <PackagesByDateView 
          selectedDate={viewingPackagesByDate}
          onBack={onBack}
          onAddPackage={onAddPackage}
          disableChat={disableChat}
          previewRole={previewRole}
        />
      ) : (
        <>
          <CalendarView 
            trips={trips}
            isLoading={tripsLoading}
            onAddPackage={onAddPackage}
            onCreateTrip={onCreateTrip}
            onViewPackagesByDate={onViewPackagesByDate}
          />
          <TripsWithFlightsView 
            onAddPackage={onAddPackage}
          />
        </>
      )}
    </TabsContent>
  );
}
