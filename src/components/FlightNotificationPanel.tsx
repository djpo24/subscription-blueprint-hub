
import { useFlightNotifications } from '@/hooks/useFlightNotifications';
import { FlightMonitoringCard } from './flight/FlightMonitoringCard';
import { TestNotificationCard } from './flight/TestNotificationCard';
import { FlightInformationCard } from './flight/FlightInformationCard';
import { UpcomingFlightsCard } from './flight/UpcomingFlightsCard';

export function FlightNotificationPanel() {
  const { 
    pendingFlights, 
    isLoading, 
    processNotifications, 
    updateFlightStatus,
    sendTestNotification,
    isProcessing,
    isSendingTest
  } = useFlightNotifications();

  return (
    <div className="space-y-6">
      <FlightMonitoringCard />

      <TestNotificationCard 
        onSendTestNotification={sendTestNotification}
        isSendingTest={isSendingTest}
      />

      <UpcomingFlightsCard />

      <FlightInformationCard 
        pendingFlights={pendingFlights}
        isLoading={isLoading}
        isProcessing={isProcessing}
        onProcessNotifications={processNotifications}
        onUpdateFlightStatus={updateFlightStatus}
      />
    </div>
  );
}
