
import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { MainTabs } from '@/components/MainTabs';
import { DashboardTab } from '@/components/tabs/DashboardTab';
import { TripsTab } from '@/components/tabs/TripsTab';
import { ChatTab } from '@/components/tabs/ChatTab';
import { NotificationsTab } from '@/components/tabs/NotificationsTab';
import { SettingsTab } from '@/components/tabs/SettingsTab';
import { Tabs } from '@/components/ui/tabs';
import { useIndexData } from '@/hooks/useIndexData';
import { useIndexState } from '@/hooks/useIndexState';
import { useIndexHandlers } from '@/hooks/useIndexHandlers';
import { DialogsContainer } from '@/components/dialogs/DialogsContainer';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TravelerPreviewPanelProps {
  onBack: () => void;
}

export function TravelerPreviewPanel({ onBack }: TravelerPreviewPanelProps) {
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Alert className="mb-4 border-blue-200 bg-blue-50">
        <Eye className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span className="text-blue-800">
            <strong>Vista Preview:</strong> Panel como Viajero - Acceso limitado solo a viajes asignados
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
        />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4 sm:mt-8">
          <DashboardTab
            packageStats={travelerPackageStats}
            customersCount={Math.floor(customersCount / 3)}
            onNewPackage={() => {}} // Deshabilitado para viajeros
            onNewTrip={() => {}} // Deshabilitado para viajeros
            onViewNotifications={handleViewNotifications}
            onMobileDelivery={() => {}} // Deshabilitado para viajeros
            packages={travelerPackages}
            filteredPackages={travelerFilteredPackages}
            isLoading={isLoading}
            onUpdate={() => {}} // Solo lectura para viajeros
          />
          
          <TripsTab 
            viewingPackagesByDate={viewingPackagesByDate}
            trips={trips.filter(trip => trip.traveler_id === 'current-traveler-id')} // Solo viajes asignados
            tripsLoading={tripsLoading}
            onAddPackage={() => {}} // Deshabilitado para viajeros
            onCreateTrip={() => {}} // Deshabilitado para viajeros
            onViewPackagesByDate={handleViewPackagesByDate}
            onBack={handleBackToCalendar}
          />
          
          <ChatTab />
          <NotificationsTab />
          <SettingsTab />
        </Tabs>

        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="font-semibold text-yellow-800 mb-2">Limitaciones del Rol Viajero:</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Solo puede ver viajes asignados a él</li>
            <li>• No puede crear nuevos paquetes o viajes</li>
            <li>• No puede acceder al panel de usuarios</li>
            <li>• No puede acceder al panel de despachos</li>
            <li>• No puede acceder al panel de deudores</li>
            <li>• Solo puede ver estadísticas de sus propios viajes</li>
            <li>• Acceso de solo lectura a la mayoría de funciones</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
