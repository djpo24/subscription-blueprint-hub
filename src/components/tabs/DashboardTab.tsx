
import { TabsContent } from '@/components/ui/tabs';
import { StatsGrid } from '@/components/StatsGrid';
import { QuickActions } from '@/components/QuickActions';
import { PackagesTable } from '@/components/PackagesTable';
import { TestQRCode } from '@/components/TestQRCode';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const isMobile = useIsMobile();

  return (
    <TabsContent value="dashboard" className="space-y-3 sm:space-y-4 lg:space-y-6 mt-4">
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

      {/* QR Code de prueba - Solo mostrar en móvil */}
      {isMobile && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <h3 className="text-base font-semibold mb-3 text-center">QR de Prueba</h3>
          <TestQRCode />
        </div>
      )}

      <div className="w-full overflow-x-auto">
        <PackagesTable
          packages={packages}
          filteredPackages={filteredPackages}
          isLoading={isLoading}
          onUpdate={onUpdate}
          disableChat={false}
          previewRole={previewRole}
        />
      </div>
    </TabsContent>
  );
}
