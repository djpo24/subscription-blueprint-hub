
import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { DashboardTab } from '@/components/tabs/DashboardTab';
import { TripsTab } from '@/components/tabs/TripsTab';
import { DispatchesTab } from '@/components/tabs/DispatchesTab';
import { ChatTab } from '@/components/tabs/ChatTab';
import { NotificationsTab } from '@/components/tabs/NotificationsTab';
import { SettingsTab } from '@/components/tabs/SettingsTab';
import { UsersTab } from '@/components/tabs/UsersTab';
import { DeveloperTab } from '@/components/tabs/DeveloperTab';
import { FinancesTab } from '@/components/tabs/FinancesTab';
import { Tabs } from '@/components/ui/tabs';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { useIndexData } from '@/hooks/useIndexData';
import { useIndexState } from '@/hooks/useIndexState';
import { useIndexHandlers } from '@/hooks/useIndexHandlers';
import { DialogsContainer } from '@/components/dialogs/DialogsContainer';
import { MobileDeliveryView } from '@/components/mobile/MobileDeliveryView';

export default function Index() {
  const [showMobileDelivery, setShowMobileDelivery] = useState(false);

  const {
    packagesData,
    trips,
    tripsLoading,
    refetchTrips,
    customersCount,
    packageStats,
    unreadCount,
    refetchUnreadMessages,
  } = useIndexData();
  
  const {
    searchTerm,
    setSearchTerm,
    packageDialogOpen,
    setPackageDialogOpen,
    tripDialogOpen,
    setTripDialogOpen,
    selectedTripId,
    setSelectedTripId,
    selectedDate,
    setSelectedDate,
    activeTab,
    setActiveTab,
    viewingPackagesByDate,
    setViewingPackagesByDate,
  } = useIndexState();

  const {
    handleNewPackage,
    handleAddPackageToTrip,
    handleCreateTripFromCalendar,
    handleViewPackagesByDate,
    handlePackageSuccess,
    handleTripSuccess,
    handleTripDialogClose,
    handleViewNotifications,
    handlePackagesUpdate,
    handleBackToCalendar,
  } = useIndexHandlers({
    activeTab,
    refetchUnreadMessages,
    refetchTrips,
    packagesRefetch: packagesData?.refetch || (() => {}),
    setSelectedTripId,
    setPackageDialogOpen,
    setTripDialogOpen,
    setSelectedDate,
    setViewingPackagesByDate,
    setActiveTab,
  });

  const handleMobileDelivery = () => {
    setShowMobileDelivery(true);
  };

  useEffect(() => {
    refetchUnreadMessages();
  }, []);

  const packages = packagesData?.data || [];
  const isLoading = packagesData?.isLoading || false;

  const filteredPackages = packages.filter((pkg: any) => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      pkg.tracking_number.toLowerCase().includes(searchTermLower) ||
      pkg.description.toLowerCase().includes(searchTermLower) ||
      pkg.customers?.name.toLowerCase().includes(searchTermLower)
    );
  });

  if (showMobileDelivery) {
    return <MobileDeliveryView onClose={() => setShowMobileDelivery(false)} />;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen bg-gray-50 w-full flex">
        <AppSidebar 
          activeTab={activeTab} 
          onTabChange={setActiveTab}
          unreadCount={unreadCount}
        />
        <SidebarInset className="flex-1">
          <Header searchTerm={searchTerm} onSearchChange={setSearchTerm} />
          
          <main className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
            <div className="flex items-center gap-2 mb-4">
              <SidebarTrigger />
              <h2 className="text-xl font-semibold">
                {activeTab === 'dashboard' && 'Dashboard'}
                {activeTab === 'trips' && 'Viajes'}
                {activeTab === 'dispatches' && 'Despachos'}
                {activeTab === 'finances' && 'Finanzas'}
                {activeTab === 'chat' && 'Chat'}
                {activeTab === 'notifications' && 'Notificaciones'}
                {activeTab === 'users' && 'Usuarios'}
                {activeTab === 'settings' && 'Configuración'}
                {activeTab === 'developer' && 'Preview'}
              </h2>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <DashboardTab
                packageStats={packageStats}
                customersCount={customersCount}
                onNewPackage={handleNewPackage}
                onNewTrip={() => handleCreateTripFromCalendar(new Date())}
                onViewNotifications={handleViewNotifications}
                onMobileDelivery={handleMobileDelivery}
                packages={packages}
                filteredPackages={filteredPackages}
                isLoading={isLoading}
                onUpdate={handlePackagesUpdate}
              />
              
              <TripsTab 
                viewingPackagesByDate={viewingPackagesByDate}
                trips={trips}
                tripsLoading={tripsLoading}
                onAddPackage={handleAddPackageToTrip}
                onCreateTrip={handleCreateTripFromCalendar}
                onViewPackagesByDate={handleViewPackagesByDate}
                onBack={handleBackToCalendar}
              />
              <DispatchesTab />
              <FinancesTab />
              <ChatTab />
              <NotificationsTab />
              <UsersTab />
              <SettingsTab />
              <DeveloperTab />
            </Tabs>

            <DialogsContainer
              packageDialogOpen={packageDialogOpen}
              setPackageDialogOpen={setPackageDialogOpen}
              onPackageSuccess={handlePackageSuccess}
              selectedTripId={selectedTripId}
              tripDialogOpen={tripDialogOpen}
              onTripDialogChange={handleTripDialogClose}
              onTripSuccess={handleTripSuccess}
              selectedDate={selectedDate}
            />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
