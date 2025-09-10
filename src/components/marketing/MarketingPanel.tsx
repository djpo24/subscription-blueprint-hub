import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MarketingSettings } from './MarketingSettings';
import { MarketingContacts } from './MarketingContacts';
import { MarketingStats } from './MarketingStats';
import { FreightRatesManager } from './FreightRatesManager';
import { TripNotificationsManager } from './TripNotificationsManager';
import { Settings, Users, BarChart3, DollarSign, Plane, AlertTriangle } from 'lucide-react';

export function MarketingPanel() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Panel de Marketing DESHABILITADO</h1>
          <p className="text-red-600 mt-2">
            Las campañas automáticas han sido completamente eliminadas. Solo funcionalidad manual disponible.
          </p>
        </div>
      </div>

      <Card className="bg-red-50 border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-800">
            <AlertTriangle className="h-5 w-5" />
            Campañas Automáticas ELIMINADAS
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-700">
            Todas las funciones de campañas automáticas de WhatsApp han sido eliminadas permanentemente.
            Solo están disponibles las funcionalidades de configuración manual.
          </p>
        </CardContent>
      </Card>

      <MarketingStats />

      <Tabs defaultValue="trip-notifications" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="trip-notifications" className="flex items-center gap-2">
            <Plane className="h-4 w-4" />
            Viajes
          </TabsTrigger>
          <TabsTrigger value="contacts" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Contactos
          </TabsTrigger>
          <TabsTrigger value="rates" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Tarifas
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configuración
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Análisis
          </TabsTrigger>
        </TabsList>

        <TabsContent value="trip-notifications" className="space-y-6">
          <TripNotificationsManager />
        </TabsContent>

        <TabsContent value="contacts" className="space-y-6">
          <MarketingContacts />
        </TabsContent>

        <TabsContent value="rates" className="space-y-6">
          <FreightRatesManager />
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <MarketingSettings />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Análisis de Campañas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">Próximamente: Métricas detalladas de rendimiento de campañas de envíos</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}