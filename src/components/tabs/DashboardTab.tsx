
import { useState } from 'react';
import { TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PackagesTable } from '@/components/PackagesTable';
import { StatsGrid } from '@/components/StatsGrid';
import { QuickActions } from '@/components/QuickActions';
import { Plus, Package, Plane, Bell, Smartphone } from 'lucide-react';
import { MobileDeliveryView } from '@/components/mobile/MobileDeliveryView';

interface DashboardTabProps {
  packageStats: any;
  customersCount: number;
  onNewPackage: () => void;
  onNewTrip: () => void;
  onViewNotifications: () => void;
  packages: any[];
  filteredPackages: any[];
  isLoading: boolean;
  onUpdate: () => void;
}

export function DashboardTab({
  packageStats,
  customersCount,
  onNewPackage,
  onNewTrip,
  onViewNotifications,
  packages,
  filteredPackages,
  isLoading,
  onUpdate
}: DashboardTabProps) {
  const [showMobileDelivery, setShowMobileDelivery] = useState(false);

  if (showMobileDelivery) {
    return <MobileDeliveryView onClose={() => setShowMobileDelivery(false)} />;
  }

  return (
    <TabsContent value="dashboard" className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Gestiona tus encomiendas y viajes
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          {/* Mobile Delivery Button */}
          <Button
            onClick={() => setShowMobileDelivery(true)}
            variant="outline"
            className="w-full sm:w-auto order-3 sm:order-1"
          >
            <Smartphone className="h-4 w-4 mr-2" />
            Entrega Móvil
          </Button>
          
          <Button onClick={onNewPackage} className="w-full sm:w-auto order-1 sm:order-2">
            <Plus className="h-4 w-4 mr-2" />
            Nueva Encomienda
          </Button>
          
          <Button onClick={onNewTrip} variant="outline" className="w-full sm:w-auto order-2 sm:order-3">
            <Plane className="h-4 w-4 mr-2" />
            Nuevo Viaje
          </Button>
        </div>
      </div>

      <StatsGrid 
        packageStats={packageStats} 
        customersCount={customersCount}
      />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Acciones Rápidas
            </CardTitle>
            <CardDescription>
              Herramientas para gestión diaria
            </CardDescription>
          </CardHeader>
          <CardContent>
            <QuickActions 
              onNewPackage={onNewPackage}
              onNewTrip={onNewTrip}
              onViewNotifications={onViewNotifications}
              onMobileDelivery={() => setShowMobileDelivery(true)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Estado del Sistema
            </CardTitle>
            <CardDescription>
              Información general del sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Total encomiendas:</span>
                <span className="font-medium">{packages.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Clientes registrados:</span>
                <span className="font-medium">{customersCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Estado del sistema:</span>
                <span className="text-green-600 font-medium">Operativo</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Encomiendas Recientes</CardTitle>
          <CardDescription>
            Las últimas encomiendas registradas en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PackagesTable 
            packages={filteredPackages} 
            isLoading={isLoading}
            onUpdate={onUpdate}
          />
        </CardContent>
      </Card>
    </TabsContent>
  );
}
