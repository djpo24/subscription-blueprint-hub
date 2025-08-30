
import React, { useState, useEffect } from 'react';
import { MainTabs } from '@/components/MainTabs';
import { MobileDeliveryDialog } from '@/components/mobile/MobileDeliveryDialog';
import { usePackageStats } from '@/hooks/usePackageStats';
import { useCustomersCount } from '@/hooks/useCustomersCount';
import { useQueryState } from '@/hooks/useQueryState';
import { usePackages } from '@/hooks/usePackages';
import { useTrips } from '@/hooks/useTrips';

export default function Index() {
  const [activeTab, setActiveTab] = useQueryState('tab', 'dashboard');
  const [isMobileDeliveryOpen, setIsMobileDeliveryOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [viewingPackagesByDate, setViewingPackagesByDate] = useState<Date | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const { data: packageStats, isLoading: isLoadingStats } = usePackageStats();
  const { data: customersCount, isLoading: isLoadingCustomers } = useCustomersCount();
  const { 
    packages, 
    filteredPackages,
    isLoading, 
    updatePackage,
    disableChat
  } = usePackages();
  const { trips, tripsLoading, createTrip, addPackageToTrip } = useTrips();

  const handleNewPackage = () => {
    setActiveTab('dispatches');
  };

  const handleNewTrip = () => {
    setActiveTab('trips');
  };

  const handleViewNotifications = () => {
    setActiveTab('notifications');
  };

  const handleMobileDelivery = () => {
    setIsMobileDeliveryOpen(true);
  };

  const handleCloseMobileDelivery = () => {
    setIsMobileDeliveryOpen(false);
  };

  const handleCreateTrip = async (date: Date) => {
    await createTrip(date);
  };

  const handleAddPackage = async (tripId: string) => {
    await addPackageToTrip(tripId);
  };

  const handleBack = () => {
    setViewingPackagesByDate(null);
  };

  useEffect(() => {
    // Simulación de actualización de notificaciones no leídas
    setTimeout(() => {
      setUnreadCount(5);
    }, 3000);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-2 sm:p-4">
      <MainTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        unreadCount={unreadCount}
        packageStats={packageStats}
        customersCount={customersCount}
        onNewPackage={handleNewPackage}
        onNewTrip={handleNewTrip}
        onViewNotifications={handleViewNotifications}
        onMobileDelivery={handleMobileDelivery}
        packages={packages}
        filteredPackages={filteredPackages}
        isLoading={isLoading}
        onUpdate={updatePackage}
        disableChat={disableChat}
        viewingPackagesByDate={viewingPackagesByDate}
        trips={trips}
        tripsLoading={tripsLoading}
        onAddPackage={handleAddPackage}
        onCreateTrip={handleCreateTrip}
        onViewPackagesByDate={setViewingPackagesByDate}
        onBack={handleBack}
        selectedDate={selectedDate}
      />

      <MobileDeliveryDialog 
        isOpen={isMobileDeliveryOpen}
        onClose={handleCloseMobileDelivery}
      />
    </div>
  );
}
