
import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { MainTabs } from '@/components/MainTabs';
import { DashboardTab } from '@/components/tabs/DashboardTab';
import { TripsTab } from '@/components/tabs/TripsTab';
import { DispatchesTab } from '@/components/tabs/DispatchesTab';
import { DebtorsTab } from '@/components/tabs/DebtorsTab';
import { ChatTab } from '@/components/tabs/ChatTab';
import { Tabs } from '@/components/ui/tabs';
import { useIndexData } from '@/hooks/useIndexData';
import { useIndexState } from '@/hooks/useIndexState';
import { useIndexHandlers } from '@/hooks/useIndexHandlers';
import { DialogsContainer } from '@/components/dialogs/DialogsContainer';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MobileDeliveryView } from '@/components/mobile/MobileDeliveryView';

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

  const travelerPackages = packages.slice(0, 3); // Solo mostrar algunos paquetes
  const travelerFilteredPackages = filteredPackages.slice(0, 3);

  // Filtrar viajes solo para los asignados al viajero actual
  const travelerTrips = trips.filter(trip => trip.traveler_id === 'current-traveler-id');

  if (showMobileDelivery) {
    return <MobileDeliveryView onClose={() => setShowMobileDelivery(false)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Alert className="mb-4 border-blue-200 bg-blue-50">
        <Eye className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span className="text-blue-800">
            <strong>Vista Preview:</strong> Panel como Viajero - Puede crear paquetes y viajes, acceso a sus viajes asignados y entrega móvil
          </span>
          <Button variant="outline" size="sm" onClick={onBack} className="ml-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </AlertDescription>
      </Alert>

      <Header searchTerm={searchTerm} onSearchChange={setSearchTerm} />
      
      <main className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <MainTabs 
          activeTab={activeTab} 
          onTabChange={setActiveTab}
          unreadCount={unreadCount}
          previewRole="traveler"
        />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4 sm:mt-8">
          <DashboardTab
            packageStats={travelerPackageStats}
            customersCount={Math.floor(customersCount / 3)}
            onNewPackage={handleNewPackage} // Habilitado para viajeros
            onNewTrip={() => handleCreateTripFromCalendar(new Date())} // Habilitado para viajeros
            onViewNotifications={() => {}} // No disponible para viajeros
            onMobileDelivery={handleMobileDelivery} // Habilitado para viajeros
            packages={travelerPackages}
            filteredPackages={travelerFilteredPackages}
            isLoading={isLoading}
            onUpdate={handlePackagesUpdate}
          />
          
          <TripsTab 
            viewingPackagesByDate={viewingPackagesByDate}
            trips={travelerTrips} // Solo viajes asignados
            tripsLoading={tripsLoading}
            onAddPackage={handleAddPackageToTrip} // Habilitado para viajeros
            onCreateTrip={handleCreateTripFromCalendar} // Habilitado para viajeros
            onViewPackagesByDate={handleViewPackagesByDate}
            onBack={handleBackToCalendar}
          />
          
          <DispatchesTab />
          <DebtorsTab />
          <ChatTab />
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

        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="font-semibold text-yellow-800 mb-2">Permisos del Rol Viajero:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-green-700 mb-2">✅ Puede acceder a:</h4>
              <ul className="text-green-700 space-y-1">
                <li>• Dashboard (vista limitada)</li>
                <li>• Crear nuevos paquetes</li>
                <li>• Crear nuevos viajes</li>
                <li>• Viajes (solo los asignados)</li>
                <li>• Despachos (solo los relacionados)</li>
                <li>• Deudores (solo los relacionados)</li>
                <li>• Chat (funcionalidad básica)</li>
                <li>• Entrega móvil</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-red-700 mb-2">❌ No puede acceder a:</h4>
              <ul className="text-red-700 space-y-1">
                <li>• Notificaciones</li>
                <li>• Gestión de usuarios</li>
                <li>• Configuración del sistema</li>
                <li>• Funciones administrativas</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
