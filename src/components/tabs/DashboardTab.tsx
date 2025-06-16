
import { TabsContent } from '@/components/ui/tabs';
import { StatsGrid } from '@/components/StatsGrid';
import { QuickActions } from '@/components/QuickActions';
import { PackagesTable } from '@/components/PackagesTable';

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
  onTabChange: (tab: string) => void;
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
  previewRole,
  onTabChange
}: DashboardTabProps) {
  const handleStatClick = (statType: string) => {
    switch (statType) {
      case 'packages':
        // Quedarse en dashboard pero mostrar tabla de paquetes (ya está visible)
        break;
      case 'customers':
        onTabChange('customers');
        break;
      case 'in-transit':
        // Quedarse en dashboard pero podríamos filtrar por en tránsito en el futuro
        break;
      case 'delivered':
        // Quedarse en dashboard pero podríamos filtrar por entregados en el futuro
        break;
      default:
        break;
    }
  };

  return (
    <TabsContent value="dashboard" className="space-y-3 sm:space-y-4 lg:space-y-6 mt-4">
      <StatsGrid
        packageStats={packageStats}
        customersCount={customersCount}
        onStatClick={handleStatClick}
      />
      
      <QuickActions
        onNewPackage={onNewPackage}
        onNewTrip={onNewTrip}
        onViewNotifications={onViewNotifications}
        onMobileDelivery={onMobileDelivery}
      />

      <div className="w-full overflow-x-auto">
        <PackagesTable
          packages={packages} // Las 20 más recientes
          filteredPackages={packages} // Pasamos packages directamente ya que la búsqueda ahora es global
          isLoading={isLoading}
          onUpdate={onUpdate}
          disableChat={false}
          previewRole={previewRole}
        />
      </div>
    </TabsContent>
  );
}
