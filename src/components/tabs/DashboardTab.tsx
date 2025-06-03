import { TabsContent } from '@/components/ui/tabs';
import { StatsGrid } from '@/components/StatsGrid';
import { QuickActions } from '@/components/QuickActions';
import { PackagesTable } from '@/components/PackagesTable';
import { TestQRCode } from '@/components/TestQRCode';

interface DashboardTabProps {
  packageStats: {
    totalPackages: number;
    packagesInTransit: number;
    packagesDelivered: number;
  };
  customersCount: number;
  onNewPackage: () => void;
  onNewTrip: () => void;
  onViewNotifications: () => void;
  packages: any[];
  filteredPackages: any[];
  isLoading: boolean;
  onUpdate: (id: string, updates: any) => void;
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
        packages={packages}
      />

      {/* QR Code de prueba */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4 text-center">QR de Prueba para Móvil</h3>
        <TestQRCode />
      </div>

      <PackagesTable
        packages={filteredPackages}
        isLoading={isLoading}
        onUpdate={onUpdate}
      />
    </TabsContent>
  );
}
