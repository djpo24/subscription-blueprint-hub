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

  const onUpdate = () => {
    packagesData?.refetch();
    refetchTrips();
  };

  const onPackageSuccess = () => {
    setPackageDialogOpen(false);
    onUpdate();
  };

  const handleNewPackage = () => {
    setSelectedTripId(undefined);
    setPackageDialogOpen(true);
  };

  const handleNewTrip = () => {
    setSelectedDate(undefined);
    setTripDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onSearch={setSearchTerm} />
      
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
            onNewTrip={handleNewTrip}
            onViewNotifications={() => setActiveTab('notifications')}
            packages={packages}
            filteredPackages={filteredPackages}
            isLoading={isLoading}
            onUpdate={onUpdate}
          />
          
          <TripsTab />
          <DispatchesTab />
          <DebtorsTab />
          <ChatTab />
          <NotificationsTab />
          <SettingsTab />
        </Tabs>

        <DialogsContainer
          packageDialogOpen={packageDialogOpen}
          setPackageDialogOpen={setPackageDialogOpen}
          onPackageSuccess={onPackageSuccess}
          selectedTripId={selectedTripId}
          tripDialogOpen={tripDialogOpen}
          onTripDialogChange={setTripDialogOpen}
          onTripSuccess={onTripSuccess}
          selectedDate={selectedDate}
        />
      </main>
    </div>
  );
}
