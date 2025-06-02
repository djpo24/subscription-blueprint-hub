
import { useState, useEffect } from 'react';
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
import { PackagesByDateView } from '@/components/PackagesByDateView';
import { ChatView } from '@/components/ChatView';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NotificationBadge } from '@/components/ui/notification-badge';
import { usePackages } from '@/hooks/usePackages';
import { useTrips } from '@/hooks/useTrips';
import { useCustomersCount } from '@/hooks/useCustomersCount';
import { usePackageStats } from '@/hooks/usePackageStats';
import { useUnreadMessages } from '@/hooks/useUnreadMessages';
import { NotificationSettings } from '@/components/NotificationSettings';
import { TripsWithFlightsView } from '@/components/TripsWithFlightsView';
import { DispatchesTable } from '@/components/DispatchesTable';

const Index = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [packageDialogOpen, setPackageDialogOpen] = useState(false);
  const [tripDialogOpen, setTripDialogOpen] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState<string | undefined>();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [viewingPackagesByDate, setViewingPackagesByDate] = useState<Date | null>(null);

  // Fetch data using existing hooks
  const packagesData = usePackages();
  const { data: trips = [], isLoading: tripsLoading, refetch: refetchTrips } = useTrips();
  const { data: customersCount = 0 } = useCustomersCount();
  const { data: packageStats } = usePackageStats();
  const { unreadCount, refetch: refetchUnreadMessages } = useUnreadMessages();

  // Actualizar notificaciones cuando cambie de pestaña
  useEffect(() => {
    if (activeTab === 'chat') {
      // Cuando entra al chat, marcar como visitado y limpiar notificaciones
      const now = new Date().toISOString();
      localStorage.setItem('chat-last-visited', now);
      refetchUnreadMessages();
    }
  }, [activeTab, refetchUnreadMessages]);

  // Filter packages based on search term - ensure we always return an array
  const filteredPackages = (packagesData.data || []).filter(pkg => 
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

  const handleCreateTripFromCalendar = (date: Date) => {
    setSelectedDate(date);
    setTripDialogOpen(true);
  };

  const handleViewPackagesByDate = (date: Date) => {
    setViewingPackagesByDate(date);
    setActiveTab('trips');
  };

  const handlePackageSuccess = () => {
    setPackageDialogOpen(false);
    packagesData.refetch();
  };

  const handleTripSuccess = () => {
    setTripDialogOpen(false);
    setSelectedDate(undefined);
    refetchTrips();
  };

  const handleTripDialogClose = (open: boolean) => {
    setTripDialogOpen(open);
    if (!open) {
      setSelectedDate(undefined);
    }
  };

  const handleViewNotifications = () => {
    setActiveTab('notifications');
  };

  const handlePackagesUpdate = () => {
    packagesData.refetch();
  };

  const handleBackToCalendar = () => {
    setViewingPackagesByDate(null);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />
      
      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="trips">Viajes</TabsTrigger>
            <TabsTrigger value="dispatches">Despachos</TabsTrigger>
            <TabsTrigger value="chat" className="relative">
              Chat
              <NotificationBadge count={unreadCount} />
            </TabsTrigger>
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
          
          <TabsContent value="trips" className="space-y-8">
            {viewingPackagesByDate ? (
              <PackagesByDateView 
                selectedDate={viewingPackagesByDate}
                onBack={handleBackToCalendar}
                onAddPackage={handleAddPackageToTrip}
              />
            ) : (
              <>
                <CalendarView 
                  trips={trips}
                  isLoading={tripsLoading}
                  onAddPackage={handleAddPackageToTrip}
                  onCreateTrip={handleCreateTripFromCalendar}
                  onViewPackagesByDate={handleViewPackagesByDate}
                />
                <TripsWithFlightsView 
                  onAddPackage={handleAddPackageToTrip}
                />
              </>
            )}
          </TabsContent>
          
          <TabsContent value="dispatches" className="space-y-8">
            <DispatchesTable />
          </TabsContent>
          
          <TabsContent value="chat" className="space-y-8">
            <ChatView />
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
        onOpenChange={handleTripDialogClose}
        onSuccess={handleTripSuccess}
        initialDate={selectedDate}
      />
    </div>
  );
};

export default Index;
