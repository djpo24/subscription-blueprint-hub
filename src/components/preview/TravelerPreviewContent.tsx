import { DashboardTab } from '@/components/tabs/DashboardTab';
import { TripsTab } from '@/components/tabs/TripsTab';
import { DispatchesTab } from '@/components/tabs/DispatchesTab';
import { FinancesTab } from '@/components/tabs/FinancesTab';
import { ChatTab } from '@/components/tabs/ChatTab';
import { NotificationsTab } from '@/components/tabs/NotificationsTab';
import { CustomersTab } from '@/components/tabs/CustomersTab';
import { Tabs } from '@/components/ui/tabs';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
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
  searchTerm?: string; // Add searchTerm prop
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
  searchTerm = '' // Add searchTerm with default value
}: TravelerPreviewContentProps) {
  return (
    <SidebarProvider defaultOpen={false}>
      <div className="min-h-screen bg-gray-50 w-full flex">
        <AppSidebar 
          activeTab={activeTab} 
          onTabChange={setActiveTab}
          unreadCount={unreadCount}
          previewRole="traveler"
        />
        <SidebarInset className="flex-1">
          <main className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
            <div className="flex items-center gap-2 mb-4">
              <SidebarTrigger className="bg-black text-white hover:bg-gray-800 hover:text-white rounded-full h-10 w-10" />
              <h2 className="text-xl font-semibold">
                {activeTab === 'dashboard' && 'Dashboard'}
                {activeTab === 'trips' && 'Viajes'}
                {activeTab === 'dispatches' && 'Despachos'}
                {activeTab === 'finances' && 'Finanzas'}
                {activeTab === 'chat' && 'Chat'}
                {activeTab === 'notifications' && 'Notificaciones'}
                {activeTab === 'customers' && 'Clientes'}
                {activeTab === 'users' && 'Usuarios'}
                {activeTab === 'settings' && 'Configuración'}
                {activeTab === 'developer' && 'Preview'}
              </h2>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
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
                onTabChange={setActiveTab}
                searchTerm={searchTerm} // Pass searchTerm prop
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
              <FinancesTab />
              <CustomersTab />
              <ChatTab />
              <NotificationsTab />
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
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
