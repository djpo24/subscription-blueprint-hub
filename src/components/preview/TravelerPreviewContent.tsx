
import { MainTabs } from '@/components/MainTabs';
import { DashboardTab } from '@/components/tabs/DashboardTab';
import { TripsTab } from '@/components/tabs/TripsTab';
import { DispatchesTab } from '@/components/tabs/DispatchesTab';
import { DebtorsTab } from '@/components/tabs/DebtorsTab';
import { ChatTab } from '@/components/tabs/ChatTab';
import { Tabs } from '@/components/ui/tabs';
import { DialogsContainer } from '@/components/dialogs/DialogsContainer';

interface TravelerPreviewContentProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  unreadCount: number;
  packageStats: any;
  customersCount: number;
  packages: any[];
  filteredPackages: any[];
  isLoading: boolean;
  trips: any[];
  tripsLoading: boolean;
  viewingPackagesByDate: Date | null;
  onNewPackage: () => void;
  onNewTrip: () => void;
  onMobileDelivery: () => void;
  onPackagesUpdate: (id: string, updates: any) => void;
  onAddPackageToTrip: (tripId: string) => void;
  onCreateTripFromCalendar: (date: Date) => void;
  onViewPackagesByDate: (date: Date) => void;
  onBackToCalendar: () => void;
  packageDialogOpen: boolean;
  setPackageDialogOpen: (open: boolean) => void;
  onPackageSuccess: () => void;
  selectedTripId?: string;
  tripDialogOpen: boolean;
  onTripDialogChange: (open: boolean) => void;
  onTripSuccess: () => void;
  selectedDate?: Date;
}

export function TravelerPreviewContent({
  activeTab,
  setActiveTab,
  unreadCount,
  packageStats,
  customersCount,
  packages,
  filteredPackages,
  isLoading,
  trips,
  tripsLoading,
  viewingPackagesByDate,
  onNewPackage,
  onNewTrip,
  onMobileDelivery,
  onPackagesUpdate,
  onAddPackageToTrip,
  onCreateTripFromCalendar,
  onViewPackagesByDate,
  onBackToCalendar,
  packageDialogOpen,
  setPackageDialogOpen,
  onPackageSuccess,
  selectedTripId,
  tripDialogOpen,
  onTripDialogChange,
  onTripSuccess,
  selectedDate,
}: TravelerPreviewContentProps) {
  return (
    <main className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
      <MainTabs 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        unreadCount={unreadCount}
        previewRole="traveler"
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4 sm:mt-8">
        <DashboardTab
          packageStats={packageStats}
          customersCount={customersCount}
          onNewPackage={onNewPackage}
          onNewTrip={onNewTrip}
          onViewNotifications={() => {}}
          onMobileDelivery={onMobileDelivery}
          packages={packages}
          filteredPackages={filteredPackages}
          isLoading={isLoading}
          onUpdate={onPackagesUpdate}
        />
        
        <TripsTab 
          viewingPackagesByDate={viewingPackagesByDate}
          trips={trips}
          tripsLoading={tripsLoading}
          onAddPackage={onAddPackageToTrip}
          onCreateTrip={onCreateTripFromCalendar}
          onViewPackagesByDate={onViewPackagesByDate}
          onBack={onBackToCalendar}
        />
        
        <DispatchesTab />
        <DebtorsTab />
        <ChatTab />
      </Tabs>

      <DialogsContainer
        packageDialogOpen={packageDialogOpen}
        setPackageDialogOpen={setPackageDialogOpen}
        onPackageSuccess={onPackageSuccess}
        selectedTripId={selectedTripId}
        tripDialogOpen={tripDialogOpen}
        onTripDialogChange={onTripDialogChange}
        onTripSuccess={onTripSuccess}
        selectedDate={selectedDate}
      />
    </main>
  );
}
