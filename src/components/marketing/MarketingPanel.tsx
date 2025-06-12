
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MarketingSettings } from './MarketingSettings';
import { MarketingContacts } from './MarketingContacts';
import { MarketingCampaigns } from './MarketingCampaigns';
import { MarketingStats } from './MarketingStats';
import { FreightRatesManager } from './FreightRatesManager';
import { Send, Settings, Users, BarChart3, DollarSign } from 'lucide-react';

export function MarketingPanel() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Panel de Marketing</h1>
          <p className="text-gray-500 mt-2">
            Gestiona campañas automáticas de WhatsApp para promocionar servicios de envío de encomiendas
          </p>
        </div>
      </div>

      <MarketingStats />

      <Tabs defaultValue="campaigns" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="campaigns" className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            Campañas
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

        <TabsContent value="campaigns" className="space-y-6">
          <MarketingCampaigns />
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
