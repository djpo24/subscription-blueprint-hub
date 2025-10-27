
import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Routes, Route, Navigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { DashboardTab } from '@/components/tabs/DashboardTab';
import { TripsTab } from '@/components/tabs/TripsTab';
import { DispatchesTab } from '@/components/tabs/DispatchesTab';
import { ChatTab } from '@/components/tabs/ChatTab';
import { EscalationTab } from '@/components/tabs/EscalationTab';
import { NotificationsTab } from '@/components/tabs/NotificationsTab';
import { SettingsTab } from '@/components/tabs/SettingsTab';
import { UsersTab } from '@/components/tabs/UsersTab';
import { CustomersTab } from '@/components/tabs/CustomersTab';
import { DeveloperTab } from '@/components/tabs/DeveloperTab';
import { FinancesTab } from '@/components/tabs/FinancesTab';
import { MarketingTab } from '@/components/tabs/MarketingTab';
import { AdminInvestigationTab } from '@/components/tabs/AdminInvestigationTab';
import { FidelizationTab } from '@/components/tabs/FidelizationTab';
import { DeletedPackagesTab } from '@/components/tabs/DeletedPackagesTab';
import { Tabs } from '@/components/ui/tabs';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { useIndexData } from '@/hooks/useIndexData';
import { useIndexState } from '@/hooks/useIndexState';
import { useIndexHandlers } from '@/hooks/useIndexHandlers';
import { DialogsContainer } from '@/components/dialogs/DialogsContainer';
import { MobileDeliveryView } from '@/components/mobile/MobileDeliveryView';
import { useIsMobile } from '@/hooks/use-mobile';

export default function Index() {
  const [showMobileDelivery, setShowMobileDelivery] = useState(false);
  const isMobile = useIsMobile();
  const location = useLocation();
  const navigate = useNavigate();

  // Derive activeTab from current route
  const getActiveTabFromPath = () => {
    const path = location.pathname;
    if (path === '/dashboard' || path === '/dashboard/') return 'dashboard';
    const tabMatch = path.match(/\/dashboard\/([^/]+)/);
    return tabMatch ? tabMatch[1] : 'dashboard';
  };

  const activeTab = getActiveTabFromPath();

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
    viewingPackagesByDate,
    setViewingPackagesByDate,
  } = useIndexState();

  // Function to change tab by navigating to the route
  const setActiveTab = (tab: string) => {
    const route = tab === 'dashboard' ? '/dashboard' : `/dashboard/${tab}`;
    navigate(route);
  };

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
    <SidebarProvider defaultOpen={!isMobile}>
      <div className="min-h-screen bg-gray-50 w-full flex">
        <AppSidebar 
          activeTab={activeTab} 
          onTabChange={setActiveTab}
          unreadCount={unreadCount}
        />
        <SidebarInset className="flex-1 min-w-0">
          <Header searchTerm={searchTerm} onSearchChange={setSearchTerm} />
          
          <main className="container mx-auto px-2 sm:px-4 py-2 sm:py-4 lg:py-8 max-w-full overflow-x-hidden">
            <div className="flex items-center gap-2 mb-2 sm:mb-4">
              {!isMobile && (
                <SidebarTrigger className="bg-black text-white hover:bg-gray-800 hover:text-white rounded-full h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0" />
              )}
              <h2 className="text-lg sm:text-xl font-semibold truncate">
                {activeTab === 'dashboard' && 'Dashboard'}
                {activeTab === 'trips' && 'Viajes'}
                {activeTab === 'dispatches' && 'Despachos'}
                {activeTab === 'finances' && 'Finanzas'}
                {activeTab === 'chat' && 'Chat'}
                {activeTab === 'escalations' && 'Escalaciones'}
                {activeTab === 'notifications' && 'Notificaciones'}
                {activeTab === 'customers' && 'Clientes'}
                {activeTab === 'fidelization' && 'Fidelización'}
                {activeTab === 'users' && 'Usuarios'}
                {activeTab === 'settings' && 'Configuración'}
                {activeTab === 'developer' && 'Preview'}
                {activeTab === 'marketing' && 'Marketing'}
                {activeTab === 'admin-investigation' && 'Investigación'}
                {activeTab === 'deleted-packages' && 'Paquetes Eliminados'}
              </h2>
            </div>

            <Routes>
              <Route index element={
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
                  onTabChange={setActiveTab}
                />
              } />
              
              <Route path="trips" element={
                <TripsTab 
                  viewingPackagesByDate={viewingPackagesByDate}
                  trips={trips}
                  tripsLoading={tripsLoading}
                  onAddPackage={handleAddPackageToTrip}
                  onCreateTrip={handleCreateTripFromCalendar}
                  onViewPackagesByDate={handleViewPackagesByDate}
                  onBack={handleBackToCalendar}
                />
              } />
              
              <Route path="dispatches" element={<DispatchesTab />} />
              <Route path="finances" element={<FinancesTab />} />
              <Route path="chat" element={<ChatTab />} />
              <Route path="escalations" element={<EscalationTab />} />
              <Route path="marketing" element={<MarketingTab />} />
              <Route path="notifications" element={<NotificationsTab />} />
              <Route path="customers" element={<CustomersTab />} />
              <Route path="fidelization" element={<FidelizationTab />} />
              <Route path="users" element={<UsersTab />} />
              <Route path="admin-investigation" element={<AdminInvestigationTab />} />
              <Route path="deleted-packages" element={<DeletedPackagesTab />} />
              <Route path="settings" element={<SettingsTab />} />
              <Route path="developer" element={<DeveloperTab />} />
              
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>

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
