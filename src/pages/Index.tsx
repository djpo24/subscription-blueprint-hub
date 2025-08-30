
import { useState } from 'react';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { MainTabs } from '@/components/MainTabs';
import { EmployeePreviewHeader } from '@/components/preview/EmployeePreviewHeader';
import { TravelerPreviewHeader } from '@/components/preview/TravelerPreviewHeader';
import { AppSidebar } from '@/components/AppSidebar';
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
      <div className="flex min-h-screen w-full">
        <AppSidebar 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
          unreadCount={7}
          previewRole={previewRole}
        />

        <SidebarInset>
          <div className="flex flex-col h-screen">
            {previewRole === 'employee' && (
              <EmployeePreviewHeader onBack={onBack} />
            )}

            {previewRole === 'traveler' && (
              <TravelerPreviewHeader onBack={onBack} />
            )}

            <div className="flex-1 overflow-auto">
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
                previewRole={previewRole}
                setPreviewRole={setPreviewRole}
              />
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
