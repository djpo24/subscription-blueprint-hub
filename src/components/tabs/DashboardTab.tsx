
import { TabsContent } from '@/components/ui/tabs';
import { StatsGrid } from '@/components/StatsGrid';
import { QuickActions } from '@/components/QuickActions';
import { PackagesTable } from '@/components/PackagesTable';
import { TestQRCode } from '@/components/TestQRCode';

interface DashboardTabProps {
  packageStats: {
    total: number;
    recibido: number;
    bodega: number;
    procesado: number;
    transito: number;
    en_destino: number;
    delivered: number;
    pending: number;
    inTransit: number;
  };
  customersCount: number;
  onNewPackage: () => void;
  onNewTrip: () => void;
  onViewNotifications: () => void;
  onMobileDelivery: () => void;
  packages: any[];
  filteredPackages: any[];
  isLoading: boolean;
  onUpdate: (id: string, updates: any) => void;
  disableChat?: boolean;
  previewRole?: 'admin' | 'employee' | 'traveler';
}

export function DashboardTab({
  packageStats,
  customersCount,
  onNewPackage,
  onNewTrip,
  onViewNotifications,
  onMobileDelivery,
  packages,
  filteredPackages,
  isLoading,
  onUpdate,
  disableChat = false,
  previewRole
}: DashboardTabProps) {
  return (
    <TabsContent value="dashboard" className="space-y-4 sm:space-y-6">
      <StatsGrid
        packageStats={packageStats}
        customersCount={customersCount}
      />
      
      <QuickActions
        onNewPackage={onNewPackage}
        onNewTrip={onNewTrip}
        onViewNotifications={onViewNotifications}
        onMobileDelivery={onMobileDelivery}
      />

      {/* QR Code de prueba */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4 text-center">QR de Prueba para Móvil</h3>
        <TestQRCode />
      </div>

      <PackagesTable
        packages={packages}
        filteredPackages={filteredPackages}
        isLoading={isLoading}
        onUpdate={onUpdate}
        disableChat={disableChat}
        previewRole={previewRole}
      />
    </TabsContent>
  );
}
