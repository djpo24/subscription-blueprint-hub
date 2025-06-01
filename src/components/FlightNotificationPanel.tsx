
import { useFlightNotifications } from '@/hooks/useFlightNotifications';
import { FlightMonitoringCard } from './flight/FlightMonitoringCard';
import { TestNotificationCard } from './flight/TestNotificationCard';
import { FlightInformationCard } from './flight/FlightInformationCard';
import { UpcomingFlightsCard } from './flight/UpcomingFlightsCard';
import { DirectWhatsAppTest } from './flight/DirectWhatsAppTest';
import { MetaConnectionTest } from './flight/MetaConnectionTest';
import { WhatsAppTemplateTest } from './flight/WhatsAppTemplateTest';

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

      <MetaConnectionTest />

      <WhatsAppTemplateTest />

      <DirectWhatsAppTest />

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
