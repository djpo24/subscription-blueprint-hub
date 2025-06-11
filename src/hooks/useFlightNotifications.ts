
import { useQuery } from '@tanstack/react-query';

export function useFlightNotifications() {
  return useQuery({
    queryKey: ['flight-notifications'],
    queryFn: async () => {
      // Return empty data since flight_data table doesn't exist
      console.log('🔍 Flight notifications not available - missing database tables');
      return {
        notifications: [],
        settings: {
          enabled: false,
          arrival_notifications: false
        }
      };
    },
    refetchInterval: 60000,
  });
}
