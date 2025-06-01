
import { useFlightNotifications } from '@/hooks/useFlightNotifications';
import { FlightMonitoringCard } from './flight/FlightMonitoringCard';
import { TestNotificationCard } from './flight/TestNotificationCard';
import { FlightInformationCard } from './flight/FlightInformationCard';
import { UpcomingFlightsCard } from './flight/UpcomingFlightsCard';
import { ManualFlightMonitorButton } from './ManualFlightMonitorButton';
import { ClearCacheButton } from './ClearCacheButton';

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
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Consulta Manual de API</h3>
        <p className="text-gray-600 mb-4">
          Ejecuta una consulta completa a la API para obtener y actualizar toda la información del vuelo AV92.
        </p>
        <div className="flex gap-3">
          <ClearCacheButton />
          <ManualFlightMonitorButton />
        </div>
        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">
            <strong>Proceso recomendado:</strong> Primero limpia el caché, luego ejecuta la consulta manual para obtener datos frescos de la API con toda la información completa.
          </p>
        </div>
      </div>

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
