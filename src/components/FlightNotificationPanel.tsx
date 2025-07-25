
import { useFlightNotifications } from '@/hooks/useFlightNotifications';
import { FlightMonitoringCard } from './flight/FlightMonitoringCard';
import { TestNotificationCard } from './flight/TestNotificationCard';
import { FlightInformationCard } from './flight/FlightInformationCard';
import { UpcomingFlightsCard } from './flight/UpcomingFlightsCard';
import { DirectWhatsAppTest } from './flight/DirectWhatsAppTest';
import { MetaConnectionTest } from './flight/MetaConnectionTest';
import { WhatsAppTemplateTest } from './flight/WhatsAppTemplateTest';
import { WebhookSetupGuide } from './WebhookSetupGuide';
import { WebhookTester } from './WebhookTester';
import { NewWebhookCard } from './NewWebhookCard';
import { MessageDeliveryStatus } from './MessageDeliveryStatus';
import { IncomingMessages } from './IncomingMessages';

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

  const handleUpdateFlightStatus = (params: { flightId: string; hasLanded: boolean }) => {
    // Convert to the expected signature for flight notifications
    updateFlightStatus(params.flightId, params.hasLanded ? 'landed' : 'delayed');
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <FlightMonitoringCard />

      <MetaConnectionTest />

      <NewWebhookCard />

      <WebhookTester />

      <WebhookSetupGuide />

      <WhatsAppTemplateTest />

      <DirectWhatsAppTest />

      <TestNotificationCard 
        onSendTestNotification={sendTestNotification}
        isSendingTest={isSendingTest}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <MessageDeliveryStatus />
        <IncomingMessages />
      </div>

      <UpcomingFlightsCard />

      <FlightInformationCard 
        pendingFlights={pendingFlights}
        isLoading={isLoading}
        isProcessing={isProcessing}
        onProcessNotifications={processNotifications}
        onUpdateFlightStatus={handleUpdateFlightStatus}
      />
    </div>
  );
}
