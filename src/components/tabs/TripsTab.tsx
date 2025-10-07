import { useState } from 'react';
import { CalendarView } from '@/components/CalendarView';
import { PackagesByDateView } from '@/components/PackagesByDateView';
import { TripsWithFlightsView } from '@/components/TripsWithFlightsView';
import { TabsContent, Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TripsListView } from '@/components/trips-list/TripsListView';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const [activeSubTab, setActiveSubTab] = useState('calendar');
  const isMobile = useIsMobile();

  return (
    <TabsContent value="trips" className={`space-y-4 ${isMobile ? 'px-2' : 'sm:space-y-8 px-2 sm:px-0'}`}>
      {viewingPackagesByDate ? (
        <PackagesByDateView 
          selectedDate={viewingPackagesByDate}
          onBack={onBack}
          onAddPackage={onAddPackage}
          disableChat={disableChat}
          previewRole={previewRole}
        />
      ) : (
        <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="calendar">Calendario</TabsTrigger>
            <TabsTrigger value="list">Listado</TabsTrigger>
          </TabsList>
          
          <TabsContent value="calendar" className="mt-4 space-y-4 sm:space-y-8">
            <CalendarView 
              trips={trips}
              isLoading={tripsLoading}
              onAddPackage={onAddPackage}
              onCreateTrip={onCreateTrip}
              onViewPackagesByDate={onViewPackagesByDate}
              previewRole={previewRole}
            />
            <TripsWithFlightsView 
              onAddPackage={onAddPackage}
            />
          </TabsContent>
          
          <TabsContent value="list" className="mt-4">
            <TripsListView />
          </TabsContent>
        </Tabs>
      )}
    </TabsContent>
  );
}
