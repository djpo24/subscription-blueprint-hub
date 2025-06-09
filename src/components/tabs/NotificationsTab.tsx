import { FlightNotificationPanel } from '@/components/FlightNotificationPanel';
import { NotificationLogTable } from '@/components/NotificationLogTable';
import { TabsContent } from '@/components/ui/tabs';
import { ArrivalNotificationsPanel } from '@/components/flight/ArrivalNotificationsPanel';
import { DestinationAddressesManager } from '@/components/flight/DestinationAddressesManager';

export function NotificationsTab() {
  return (
    <TabsContent value="notifications" className="space-y-4 sm:space-y-8 px-2 sm:px-0">
      <ArrivalNotificationsPanel />
      <DestinationAddressesManager />
      <FlightNotificationPanel />
      <NotificationLogTable />
    </TabsContent>
  );
}
