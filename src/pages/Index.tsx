import { useState } from 'react';
import { Sidebar } from '@/components/ui/sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { MainTabs } from '@/components/MainTabs';
import { PackageCreationPanel } from '@/components/PackageCreationPanel';
import { DashboardViewSwitcher } from '@/components/dashboard/DashboardViewSwitcher';
import { EmployeePreviewHeader } from '@/components/preview/EmployeePreviewHeader';
import { TravelerPreviewHeader } from '@/components/preview/TravelerPreviewHeader';
import { AppSidebar } from '@/components/sidebar/AppSidebar';
import { MobileDeliveryDialog } from '@/components/delivery/MobileDeliveryDialog';
import { TripCreationDialog } from '@/components/TripCreationDialog';
import { NewPackageDialog } from '@/components/NewPackageDialog';
import { useIndex } from '@/hooks/useIndex';
import { usePackagesData } from '@/hooks/usePackagesData';
import { useTripsData } from '@/hooks/useTripsData';

export default function Index() {
  const {
    activeTab,
    setActiveTab,
    isMobileDeliveryOpen,
    setIsMobileDeliveryOpen,
    isNewTripOpen,
    setIsNewTripOpen,
    isNewPackageOpen,
    setIsNewPackageOpen,
    selectedDate,
    setSelectedDate,
    viewingPackagesByDate,
    setViewingPackagesByDate,
    onBack,
    previewRole,
    setPreviewRole
  } = useIndex();

  const {
    packageStats,
    customersCount,
    packages,
    filteredPackages,
    isLoading,
    onUpdate,
    onNewPackage,
    onNewTrip
  } = usePackagesData();

  const {
    trips,
    tripsLoading,
    onAddPackage,
    onCreateTrip
  } = useTripsData(selectedDate);

  const [selectedPackage, setSelectedPackage] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [chatDialogOpen, setChatDialogOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedCustomerName, setSelectedCustomerName] = useState('');
  const [selectedTripId, setSelectedTripId] = useState('');

  const onPackageClick = (pkg, tripId) => {
    setSelectedPackage(pkg);
    setSelectedTripId(tripId);
    setEditDialogOpen(true);
  };

  const onPackageEditSuccess = () => {
    setEditDialogOpen(false);
  };

  const onOpenChat = (customerId, customerName) => {
    setSelectedCustomerId(customerId);
    setSelectedCustomerName(customerName);
    setChatDialogOpen(true);
  };

  return (
    <SidebarProvider>
      <div className="md:pl-64 flex h-screen antialiased text-gray-900 bg-gray-50">
        <AppSidebar 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
          unreadCount={7}
          previewRole={previewRole}
          setPreviewRole={setPreviewRole}
        />

        <Sidebar.Container>
          <Sidebar.Content>
            {previewRole === 'employee' && (
              <EmployeePreviewHeader onBack={onBack} />
            )}

            {previewRole === 'traveler' && (
              <TravelerPreviewHeader onBack={onBack} />
            )}

            <MainTabs
              activeTab={activeTab}
              onTabChange={setActiveTab}
              packageStats={packageStats}
              customersCount={customersCount}
              onNewPackage={onNewPackage}
              onNewTrip={onNewTrip}
              onViewNotifications={() => setActiveTab('notifications')}
              onMobileDelivery={() => setIsMobileDeliveryOpen(true)}
              packages={packages}
              filteredPackages={filteredPackages}
              isLoading={isLoading}
              onUpdate={onUpdate}
              viewingPackagesByDate={viewingPackagesByDate}
              trips={trips}
              tripsLoading={tripsLoading}
              onAddPackage={onAddPackage}
              onCreateTrip={onCreateTrip}
              onViewPackagesByDate={setViewingPackagesByDate}
              onBack={onBack}
              selectedDate={selectedDate}
            />
          </Sidebar.Content>
        </Sidebar.Container>

        <MobileDeliveryDialog
          open={isMobileDeliveryOpen}
          onOpenChange={setIsMobileDeliveryOpen}
        />

        <TripCreationDialog
          open={isNewTripOpen}
          onOpenChange={setIsNewTripOpen}
          selectedDate={selectedDate}
          onCreateTrip={onCreateTrip}
        />

        <NewPackageDialog
          open={isNewPackageOpen}
          onOpenChange={setIsNewPackageOpen}
        />
      </div>
    </SidebarProvider>
  );
}
