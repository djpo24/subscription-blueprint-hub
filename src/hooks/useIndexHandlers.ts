
import { useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';

interface UseIndexHandlersParams {
  activeTab: string;
  refetchUnreadMessages: () => void;
  refetchTrips: () => void;
  packagesRefetch: () => void;
  setSelectedTripId: (id: string) => void;
  setPackageDialogOpen: (open: boolean) => void;
  setTripDialogOpen: (open: boolean) => void;
  setSelectedDate: (date: Date | null) => void;
  setViewingPackagesByDate: (date: Date | null) => void;
  setActiveTab: (tab: string) => void;
}

export function useIndexHandlers({
  activeTab,
  refetchUnreadMessages,
  refetchTrips,
  packagesRefetch,
  setSelectedTripId,
  setPackageDialogOpen,
  setTripDialogOpen,
  setSelectedDate,
  setViewingPackagesByDate,
  setActiveTab,
}: UseIndexHandlersParams) {
  const queryClient = useQueryClient();

  const handleNewPackage = () => {
    setSelectedTripId('');
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
  };

  const handlePackageSuccess = () => {
    setPackageDialogOpen(false);
    
    // Invalidar múltiples consultas para asegurar sincronización
    queryClient.invalidateQueries({ queryKey: ['packages'] });
    queryClient.invalidateQueries({ queryKey: ['trips'] });
    queryClient.invalidateQueries({ queryKey: ['packages-by-date'] });
    queryClient.invalidateQueries({ queryKey: ['packages-by-trip'] });
    
    packagesRefetch();
    refetchTrips();
  };

  const handleTripSuccess = () => {
    setTripDialogOpen(false);
    setSelectedDate(null);
    
    // Invalidar consultas de viajes y paquetes
    queryClient.invalidateQueries({ queryKey: ['trips'] });
    queryClient.invalidateQueries({ queryKey: ['packages-by-date'] });
    
    refetchTrips();
  };

  const handleTripDialogClose = (open: boolean) => {
    if (!open) {
      setSelectedDate(null);
    }
    setTripDialogOpen(open);
  };

  const handleViewNotifications = () => {
    setActiveTab('notifications');
    refetchUnreadMessages();
  };

  const handlePackagesUpdate = () => {
    // Invalidar todas las consultas relacionadas con paquetes
    queryClient.invalidateQueries({ queryKey: ['packages'] });
    queryClient.invalidateQueries({ queryKey: ['packages-by-date'] });
    queryClient.invalidateQueries({ queryKey: ['packages-by-trip'] });
    queryClient.invalidateQueries({ queryKey: ['trips'] });
    
    packagesRefetch();
    refetchTrips();
  };

  const handleBackToCalendar = () => {
    setViewingPackagesByDate(null);
    
    // Refrescar datos del calendario
    queryClient.invalidateQueries({ queryKey: ['trips'] });
    refetchTrips();
  };

  return {
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
  };
}
