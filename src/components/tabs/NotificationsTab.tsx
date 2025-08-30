
import { FlightNotificationPanel } from '@/components/FlightNotificationPanel';
import { NotificationLogTable } from '@/components/NotificationLogTable';
import { TabsContent } from '@/components/ui/tabs';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrivalNotificationsPanel } from '@/components/flight/ArrivalNotificationsPanel';
import { CampaignNotificationsPanel } from '@/components/flight/CampaignNotificationsPanel';
import { ProximosViajesTestPanel } from '@/components/flight/ProximosViajesTestPanel';
import { Bell, Plane, Megaphone, TestTube } from 'lucide-react';

export function NotificationsTab() {
  return (
    <TabsContent value="notifications" className="space-y-4 sm:space-y-8 px-2 sm:px-0">
      <Tabs defaultValue="arrival" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="arrival" className="flex items-center gap-2">
            <Plane className="h-4 w-4" />
            Llegadas
          </TabsTrigger>
          <TabsTrigger value="campaign" className="flex items-center gap-2">
            <Megaphone className="h-4 w-4" />
            Campaña
          </TabsTrigger>
          <TabsTrigger value="test" className="flex items-center gap-2">
            <TestTube className="h-4 w-4" />
            Test
          </TabsTrigger>
          <TabsTrigger value="log" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Registro
          </TabsTrigger>
        </TabsList>

        <TabsContent value="arrival" className="space-y-6">
          <ArrivalNotificationsPanel />
          <FlightNotificationPanel />
        </TabsContent>

        <TabsContent value="campaign" className="space-y-6">
          <CampaignNotificationsPanel />
        </TabsContent>

        <TabsContent value="test" className="space-y-6">
          <ProximosViajesTestPanel />
        </TabsContent>

        <TabsContent value="log" className="space-y-6">
          <NotificationLogTable />
        </TabsContent>
      </Tabs>
    </TabsContent>
  );
}
