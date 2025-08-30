
import { usePackages } from '@/hooks/usePackages';
import { useTrips } from '@/hooks/useTrips';
import { usePackageStats } from '@/hooks/usePackageStats';
import { useCustomersCount } from '@/hooks/useCustomersCount';
import { useState } from 'react';

export function useIndexData() {
  const packagesData = usePackages();
  const tripsData = useTrips();
  const { data: packageStats, isLoading: isLoadingStats } = usePackageStats();
  const { data: customersCount, isLoading: isLoadingCustomers } = useCustomersCount();
  const [unreadCount, setUnreadCount] = useState(0);

  const refetchUnreadMessages = () => {
    // Simulate fetching unread messages
    setTimeout(() => {
      setUnreadCount(5);
    }, 1000);
  };

  return {
    packagesData,
    trips: tripsData.trips,
    tripsLoading: tripsData.tripsLoading,
    refetchTrips: tripsData.refetch,
    customersCount,
    packageStats,
    unreadCount,
    refetchUnreadMessages,
  };
}
