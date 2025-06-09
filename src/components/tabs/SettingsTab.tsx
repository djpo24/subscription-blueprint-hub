
import { NotificationSettings } from '@/components/NotificationSettings';
import { UserActionsPanel } from '@/components/admin/UserActionsPanel';
import { DestinationAddressesManager } from '@/components/flight/DestinationAddressesManager';
import { WhatsAppTemplateTest } from '@/components/flight/WhatsAppTemplateTest';
import { NotificationLogTable } from '@/components/NotificationLogTable';
import { TabsContent } from '@/components/ui/tabs';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Shield, MapPin, MessageSquare, Bell } from 'lucide-react';

export function SettingsTab() {
  return (
    <TabsContent value="settings" className="space-y-4 sm:space-y-8 px-2 sm:px-0">
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="admin" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Administración
          </TabsTrigger>
          <TabsTrigger value="addresses" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Direcciones
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Plantillas WhatsApp
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Registro
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <NotificationSettings />
        </TabsContent>

        <TabsContent value="admin" className="space-y-6">
          <UserActionsPanel />
        </TabsContent>

        <TabsContent value="addresses" className="space-y-6">
          <DestinationAddressesManager />
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <WhatsAppTemplateTest />
        </TabsContent>

        <TabsContent value="logs" className="space-y-6">
          <NotificationLogTable />
        </TabsContent>
      </Tabs>
    </TabsContent>
  );
}
