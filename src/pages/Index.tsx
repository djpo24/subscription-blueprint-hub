
import { Header } from '@/components/Header';
import { MainTabs } from '@/components/MainTabs';
import { DialogsContainer } from '@/components/dialogs/DialogsContainer';
import { useIndexData } from '@/hooks/useIndexData';
import { useIndexState } from '@/hooks/useIndexState';
import { useIndexHandlers } from '@/hooks/useIndexHandlers';

const Index = () => {
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
    packagesRefetch: packagesData.refetch,
    setSelectedTripId,
    setPackageDialogOpen,
    setTripDialogOpen,
    setSelectedDate,
    setViewingPackagesByDate,
    setActiveTab,
  });

  // Filter packages based on search term - ensure we always return an array
  const filteredPackages = (packagesData.data || []).filter(pkg => 
    pkg.tracking_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pkg.customers?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pkg.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pkg.destination.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white">
      <Header 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />
      
      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        <MainTabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          unreadCount={unreadCount}
          packageStats={packageStats}
          customersCount={customersCount}
          onNewPackage={handleNewPackage}
          onNewTrip={() => setTripDialogOpen(true)}
          onViewNotifications={handleViewNotifications}
          packages={packagesData.data || []}
          filteredPackages={filteredPackages}
          packagesLoading={packagesData.isLoading}
          onPackagesUpdate={handlePackagesUpdate}
          viewingPackagesByDate={viewingPackagesByDate}
          trips={trips}
          tripsLoading={tripsLoading}
          onAddPackage={handleAddPackageToTrip}
          onCreateTrip={handleCreateTripFromCalendar}
          onViewPackagesByDate={handleViewPackagesByDate}
          onBackToCalendar={handleBackToCalendar}
        />
      </main>

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
    </div>
  );
};

export default Index;
