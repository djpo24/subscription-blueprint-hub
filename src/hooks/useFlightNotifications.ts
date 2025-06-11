
import { useQuery } from '@tanstack/react-query';

interface FlightNotificationsResult {
  data: {
    notifications: any[];
    settings: {
      enabled: boolean;
      arrival_notifications: boolean;
    };
  };
  pendingFlights: any[];
  isLoading: boolean;
  processNotifications: () => void;
  updateFlightStatus: (flightId: string, status: string) => void;
  sendTestNotification: (params: { phone: string; message: string }) => void;
  isProcessing: boolean;
  isSendingTest: boolean;
}

export function useFlightNotifications(): FlightNotificationsResult {
  const query = useQuery({
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

  return {
    ...query,
    pendingFlights: [],
    processNotifications: () => {
      console.log('🔍 Process notifications not available - missing database tables');
    },
    updateFlightStatus: (flightId: string, status: string) => {
      console.log('🔍 Update flight status not available - missing database tables', { flightId, status });
    },
    sendTestNotification: (params: { phone: string; message: string }) => {
      console.log('🔍 Send test notification not available - missing database tables', params);
    },
    isProcessing: false,
    isSendingTest: false
  };
}
