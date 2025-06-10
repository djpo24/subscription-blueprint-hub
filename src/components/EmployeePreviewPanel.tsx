
import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { MainTabs } from '@/components/MainTabs';
import { DashboardTab } from '@/components/tabs/DashboardTab';
import { TripsTab } from '@/components/tabs/TripsTab';
import { DispatchesTab } from '@/components/tabs/DispatchesTab';
import { Tabs } from '@/components/ui/tabs';
import { useIndexData } from '@/hooks/useIndexData';
import { useIndexState } from '@/hooks/useIndexState';
import { useIndexHandlers } from '@/hooks/useIndexHandlers';
import { DialogsContainer } from '@/components/dialogs/DialogsContainer';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Briefcase, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MobileDeliveryView } from '@/components/mobile/MobileDeliveryView';

interface EmployeePreviewPanelProps {
  onBack: () => void;
}

export function EmployeePreviewPanel({ onBack }: EmployeePreviewPanelProps) {
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

  // Empleados tienen acceso completo a encomiendas pero no a gestión de usuarios, chat o deudores
  const employeePackageStats = packageStats;
  const employeePackages = packages;
  const employeeFilteredPackages = filteredPackages;

  // Empleados pueden ver todos los viajes pero no gestionar usuarios, chat o deudores
  const employeeTrips = trips;

  if (showMobileDelivery) {
    return <MobileDeliveryView onClose={() => setShowMobileDelivery(false)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Alert className="mb-4 border-blue-200 bg-blue-50">
        <Briefcase className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span className="text-blue-800">
            <strong>Vista Preview:</strong> Panel como Empleado - Acceso a operaciones diarias sin gestión de usuarios, chat, deudores, notificaciones o configuración
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
          previewRole="employee"
          packageStats={employeePackageStats}
          customersCount={customersCount}
          onNewPackage={handleNewPackage}
          onNewTrip={() => handleCreateTripFromCalendar(new Date())}
          onViewNotifications={() => {}} // Deshabilitado para empleados
          onMobileDelivery={handleMobileDelivery}
          packages={employeePackages}
          filteredPackages={employeeFilteredPackages}
          isLoading={isLoading}
          onUpdate={handlePackagesUpdate}
          disableChat={true}
          viewingPackagesByDate={viewingPackagesByDate ? selectedDate : null}
          trips={employeeTrips}
          tripsLoading={tripsLoading}
          onAddPackage={handleAddPackageToTrip}
          onCreateTrip={handleCreateTripFromCalendar}
          onViewPackagesByDate={handleViewPackagesByDate}
          onBack={handleBackToCalendar}
          selectedDate={selectedDate}
        />

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
          <h3 className="font-semibold text-yellow-800 mb-2">Permisos del Rol Empleado:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-green-700 mb-2">✅ Puede acceder a:</h4>
              <ul className="text-green-700 space-y-1">
                <li>• Dashboard completo</li>
                <li>• Gestión completa de encomiendas</li>
                <li>• Gestión de viajes</li>
                <li>• Todos los despachos</li>
                <li>• Entrega móvil</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-red-700 mb-2">❌ No puede acceder a:</h4>
              <ul className="text-red-700 space-y-1">
                <li>• Gestión de usuarios</li>
                <li>• Chat con clientes</li>
                <li>• Deudores</li>
                <li>• Notificaciones</li>
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
