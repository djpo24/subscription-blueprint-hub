
import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { useIndexData } from '@/hooks/useIndexData';
import { useIndexState } from '@/hooks/useIndexState';
import { useIndexHandlers } from '@/hooks/useIndexHandlers';
import { MobileDeliveryView } from '@/components/mobile/MobileDeliveryView';
import { TravelerPreviewHeader } from '@/components/preview/TravelerPreviewHeader';
import { TravelerPreviewContent } from '@/components/preview/TravelerPreviewContent';
import { TravelerPreviewPermissions } from '@/components/preview/TravelerPreviewPermissions';

interface TravelerPreviewPanelProps {
  onBack: () => void;
}

export function TravelerPreviewPanel({ onBack }: TravelerPreviewPanelProps) {
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

  // Simular datos limitados para viajero
  const travelerPackageStats = {
    total: Math.floor(packageStats?.total / 3) || 5,
    recibido: Math.floor(packageStats?.recibido / 3) || 2,
    bodega: Math.floor(packageStats?.bodega / 3) || 1,
    procesado: Math.floor(packageStats?.procesado / 3) || 1,
    transito: Math.floor(packageStats?.transito / 3) || 1,
    en_destino: 0,
    delivered: 0,
    pending: Math.floor(packageStats?.pending / 3) || 2,
    inTransit: Math.floor(packageStats?.inTransit / 3) || 1,
  };

  const travelerPackages = packages.slice(0, 3);
  const travelerFilteredPackages = filteredPackages.slice(0, 3);
  // Filter trips for current traveler (simplified for preview)
  const travelerTrips = trips.slice(0, 2);

  if (showMobileDelivery) {
    return <MobileDeliveryView onClose={() => setShowMobileDelivery(false)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TravelerPreviewHeader onBack={onBack} />
      <Header searchTerm={searchTerm} onSearchChange={setSearchTerm} />
      
      <TravelerPreviewContent
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        unreadCount={unreadCount}
        packageStats={travelerPackageStats}
        customersCount={Math.floor(customersCount / 3)}
        packages={travelerPackages}
        filteredPackages={travelerFilteredPackages}
        isLoading={isLoading}
        trips={travelerTrips}
        tripsLoading={tripsLoading}
        viewingPackagesByDate={viewingPackagesByDate}
        onNewPackage={handleNewPackage}
        onNewTrip={() => handleCreateTripFromCalendar(new Date())}
        onMobileDelivery={handleMobileDelivery}
        onPackagesUpdate={handlePackagesUpdate}
        onAddPackageToTrip={handleAddPackageToTrip}
        onCreateTripFromCalendar={handleCreateTripFromCalendar}
        onViewPackagesByDate={handleViewPackagesByDate}
        onBackToCalendar={handleBackToCalendar}
        packageDialogOpen={packageDialogOpen}
        setPackageDialogOpen={setPackageDialogOpen}
        onPackageSuccess={handlePackageSuccess}
        selectedTripId={selectedTripId}
        tripDialogOpen={tripDialogOpen}
        onTripDialogChange={handleTripDialogClose}
        onTripSuccess={handleTripSuccess}
        selectedDate={selectedDate}
      />

      <TravelerPreviewPermissions />
    </div>
  );
}
