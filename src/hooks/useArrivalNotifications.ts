
import { useQuery } from '@tanstack/react-query';
import type { PendingNotification } from '@/types/supabase-temp';

export function useArrivalNotifications() {
  return useQuery({
    queryKey: ['arrival-notifications'],
    queryFn: async (): Promise<PendingNotification[]> => {
      // Return empty array for now since the required tables don't exist
      console.log('🔍 Arrival notifications not available - missing database tables');
      return [];
    },
    refetchInterval: 30000,
  });
}
