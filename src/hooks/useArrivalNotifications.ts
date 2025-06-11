
import { useQuery } from '@tanstack/react-query';
import type { PendingNotification } from '@/types/supabase-temp';

interface ArrivalNotificationsResult {
  data: PendingNotification[];
  pendingNotifications: PendingNotification[];
  isLoading: boolean;
  processNotifications: () => void;
  isProcessing: boolean;
}

export function useArrivalNotifications(): ArrivalNotificationsResult {
  const query = useQuery({
    queryKey: ['arrival-notifications'],
    queryFn: async (): Promise<PendingNotification[]> => {
      // Return empty array for now since the required tables don't exist
      console.log('🔍 Arrival notifications not available - missing database tables');
      return [];
    },
    refetchInterval: 30000,
  });

  return {
    ...query,
    pendingNotifications: query.data || [],
    processNotifications: () => {
      console.log('🔍 Process notifications not available - missing database tables');
    },
    isProcessing: false
  };
}
