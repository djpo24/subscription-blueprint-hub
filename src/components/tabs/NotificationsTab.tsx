
import { FlightNotificationPanel } from '@/components/FlightNotificationPanel';
import { NotificationLogTable } from '@/components/NotificationLogTable';
import { TabsContent } from '@/components/ui/tabs';

export function NotificationsTab() {
  return (
    <TabsContent value="notifications" className="space-y-8">
      <FlightNotificationPanel />
      <NotificationLogTable />
    </TabsContent>
  );
}
