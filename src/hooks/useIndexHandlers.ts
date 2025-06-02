
import { useEffect } from 'react';

interface UseIndexHandlersProps {
  activeTab: string;
  refetchUnreadMessages: () => void;
  refetchTrips: () => void;
  packagesRefetch: () => void;
  setSelectedTripId: (id: string | undefined) => void;
  setPackageDialogOpen: (open: boolean) => void;
  setTripDialogOpen: (open: boolean) => void;
  setSelectedDate: (date: Date | undefined) => void;
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
}: UseIndexHandlersProps) {
  // Actualizar notificaciones cuando cambie de pestaña
  useEffect(() => {
    if (activeTab === 'chat') {
      // Cuando entra al chat, marcar como visitado y limpiar notificaciones
      const now = new Date().toISOString();
      localStorage.setItem('chat-last-visited', now);
      refetchUnreadMessages();
    }
  }, [activeTab, refetchUnreadMessages]);

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
    packagesRefetch();
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
    packagesRefetch();
  };

  const handleBackToCalendar = () => {
    setViewingPackagesByDate(null);
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
