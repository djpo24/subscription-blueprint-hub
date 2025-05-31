import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { StatsGrid } from '@/components/StatsGrid';
import { QuickActions } from '@/components/QuickActions';
import { PackagesTable } from '@/components/PackagesTable';
import { TripsTable } from '@/components/TripsTable';
import { CalendarView } from '@/components/CalendarView';
import { FlightNotificationPanel } from '@/components/FlightNotificationPanel';
import { NotificationLogTable } from '@/components/NotificationLogTable';
import { PackageDialog } from '@/components/PackageDialog';
import { TripDialog } from '@/components/TripDialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePackages } from '@/hooks/usePackages';
import { useTrips } from '@/hooks/useTrips';
import { useCustomersCount } from '@/hooks/useCustomersCount';
import { usePackageStats } from '@/hooks/usePackageStats';
import { NotificationSettings } from '@/components/NotificationSettings';
import { TripsWithFlightsView } from '@/components/TripsWithFlightsView';

const Index = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [packageDialogOpen, setPackageDialogOpen] = useState(false);
  const [tripDialogOpen, setTripDialogOpen] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState<string | undefined>();
  const [activeTab, setActiveTab] = useState('dashboard');

  // Fetch data using existing hooks
  const packagesData = usePackages();
  const { data: trips = [], isLoading: tripsLoading, refetch: refetchTrips } = useTrips();
  const { data: customersCount = 0 } = useCustomersCount();
  const { data: packageStats } = usePackageStats();

  // Filter packages based on search term
  const filteredPackages = packagesData.data?.filter(pkg => 
    pkg.tracking_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pkg.customers?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pkg.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pkg.destination.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleNewPackage = () => {
    setSelectedTripId(undefined);
    setPackageDialogOpen(true);
  };

  const handleAddPackageToTrip = (tripId: string) => {
    setSelectedTripId(tripId);
    setPackageDialogOpen(true);
  };

  const handlePackageSuccess = () => {
    setPackageDialogOpen(false);
    refetchPackages();
  };

  const handleTripSuccess = () => {
    setTripDialogOpen(false);
    refetchTrips();
  };

  const handleViewNotifications = () => {
    setActiveTab('notifications');
  };

  const handlePackagesUpdate = () => {
    packagesData.refetch();
  };

  return (
    <div className="min-h-screen bg-white">
      <Header 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />
      
      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="packages">Encomiendas</TabsTrigger>
            <TabsTrigger value="trips">Viajes</TabsTrigger>
            <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
            <TabsTrigger value="settings">Configuración</TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard" className="space-y-8">
            <StatsGrid 
              packageStats={packageStats}
              customersCount={customersCount}
            />
            <QuickActions 
              onNewPackage={handleNewPackage}
              onNewTrip={() => setTripDialogOpen(true)}
              onViewNotifications={handleViewNotifications}
            />
            <PackagesTable 
              packages={packagesData.data || []}
              filteredPackages={filteredPackages}
              isLoading={packagesData.isLoading}
              onUpdate={handlePackagesUpdate}
            />
          </TabsContent>
          
          <TabsContent value="packages" className="space-y-8">
            <PackagesTable 
              packages={packagesData.data || []}
              filteredPackages={filteredPackages}
              isLoading={packagesData.isLoading}
            />
          </TabsContent>
          
          <TabsContent value="trips" className="space-y-8">
            <CalendarView 
              trips={trips}
              isLoading={tripsLoading}
              onAddPackage={handleAddPackageToTrip}
            />
            <TripsWithFlightsView 
              onAddPackage={handleAddPackageToTrip}
            />
          </TabsContent>
          
          <TabsContent value="notifications" className="space-y-8">
            <FlightNotificationPanel />
            <NotificationLogTable />
          </TabsContent>

          <TabsContent value="settings" className="space-y-8">
            <NotificationSettings />
          </TabsContent>
        </Tabs>
      </main>

      <PackageDialog
        open={packageDialogOpen}
        onOpenChange={setPackageDialogOpen}
        onSuccess={handlePackageSuccess}
        tripId={selectedTripId}
      />

      <TripDialog
        open={tripDialogOpen}
        onOpenChange={setTripDialogOpen}
        onSuccess={handleTripSuccess}
      />
    </div>
  );
};

export default Index;
