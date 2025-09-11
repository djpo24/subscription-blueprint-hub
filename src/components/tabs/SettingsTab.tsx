
import { AudioMigrationButton } from '@/components/AudioMigrationButton';
import { ProfileMigrationButton } from '@/components/ProfileMigrationButton';
import { NotificationSettings } from '@/components/NotificationSettings';
import { UserActionsPanel } from '@/components/admin/UserActionsPanel';
import { DestinationAddressesManager } from '@/components/flight/DestinationAddressesManager';
import { WhatsAppTemplateTest } from '@/components/flight/WhatsAppTemplateTest';
import { NotificationLogTable } from '@/components/NotificationLogTable';
import { WebhookDiagnostic } from '@/components/WebhookDiagnostic';
import { ChatbotConfigPanel } from '@/components/settings/ChatbotConfigPanel';
import { TabsContent } from '@/components/ui/tabs';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, Shield, MapPin, MessageSquare, Bell, Bug, Bot } from 'lucide-react';

export function SettingsTab() {
  return (
    <TabsContent value="settings" className="space-y-4 sm:space-y-8 px-2 sm:px-0">
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="chatbot" className="flex items-center gap-2">
            <Bot className="h-4 w-4" />
            Chatbot
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
          <TabsTrigger value="migration" className="flex items-center gap-2">
            🎵
            Migración Audios
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Registro
          </TabsTrigger>
          <TabsTrigger value="webhook-diagnostic" className="flex items-center gap-2">
            <Bug className="h-4 w-4" />
            Diagnóstico
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <NotificationSettings />
        </TabsContent>

        <TabsContent value="chatbot" className="space-y-6">
          <ChatbotConfigPanel />
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

        <TabsContent value="migration" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Migración de Audios */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🎵 Recuperación de Audios Anteriores
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Recupera audios de WhatsApp enviados antes de la implementación del almacenamiento permanente.
                  </p>
                  <AudioMigrationButton />
                </div>
              </CardContent>
            </Card>

            {/* Migración de Fotos de Perfil */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  👤 Recuperación de Fotos de Perfil
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Obtiene y almacena permanentemente las fotos de perfil de WhatsApp de todos los clientes.
                  </p>
                  <ProfileMigrationButton />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              <strong>Nota:</strong> Estas operaciones pueden tomar varios minutos. Se recomienda ejecutar durante horarios de poco tráfico. 
              Las fotos de perfil solo se pueden obtener si los usuarios las tienen públicas en WhatsApp.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="logs" className="space-y-6">
          <NotificationLogTable />
        </TabsContent>

        <TabsContent value="webhook-diagnostic" className="space-y-6">
          <WebhookDiagnostic />
        </TabsContent>
      </Tabs>
    </TabsContent>
  );
}
