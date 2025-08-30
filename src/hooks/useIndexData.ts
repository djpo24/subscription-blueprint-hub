
import { usePackages } from '@/hooks/usePackages';
import { useTrips } from '@/hooks/useTrips';
import { useCustomersCount } from '@/hooks/useCustomersCount';
import { usePackageStats } from '@/hooks/usePackageStats';
import { useUnreadMessages } from '@/hooks/useUnreadMessages';

export function useIndexData() {
  const packagesData = usePackages();
  const { data: trips = [], isLoading: tripsLoading, refetch: refetchTrips } = useTrips();
  const { data: customersCount = 0 } = useCustomersCount();
  const { data: packageStats } = usePackageStats();
  const { unreadCount, refetch: refetchUnreadMessages } = useUnreadMessages();

  return {
    packagesData,
    trips,
    tripsLoading,
    refetchTrips,
    customersCount,
    packageStats,
    unreadCount,
    refetchUnreadMessages,
  };
}
