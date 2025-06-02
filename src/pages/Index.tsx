
import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { MainTabs } from '@/components/MainTabs';
import { DashboardTab } from '@/components/tabs/DashboardTab';
import { TripsTab } from '@/components/tabs/TripsTab';
import { DispatchesTab } from '@/components/tabs/DispatchesTab';
import { ChatTab } from '@/components/tabs/ChatTab';
import { NotificationsTab } from '@/components/tabs/NotificationsTab';
import { SettingsTab } from '@/components/tabs/SettingsTab';
import { Tabs } from '@/components/ui/tabs';
import { useIndexData } from '@/hooks/useIndexData';
import { useIndexState } from '@/hooks/useIndexState';
import { useIndexHandlers } from '@/hooks/useIndexHandlers';
import { DialogsContainer } from '@/components/dialogs/DialogsContainer';
import { DebtorsTab } from '@/components/tabs/DebtorsTab';

export default function Index() {
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header searchTerm={searchTerm} onSearchChange={setSearchTerm} />
      
      <main className="container mx-auto px-4 py-8">
        <MainTabs 
          activeTab={activeTab} 
          onTabChange={setActiveTab}
          unreadCount={unreadCount}
        />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-8">
          <DashboardTab
            packageStats={packageStats}
            customersCount={customersCount}
            onNewPackage={handleNewPackage}
            onNewTrip={() => handleCreateTripFromCalendar(new Date())}
            onViewNotifications={handleViewNotifications}
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
          <DebtorsTab />
          <ChatTab />
          <NotificationsTab />
          <SettingsTab />
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
    </div>
  );
}
