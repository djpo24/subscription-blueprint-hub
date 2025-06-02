
import { StatsGrid } from '@/components/StatsGrid';
import { QuickActions } from '@/components/QuickActions';
import { PackagesTable } from '@/components/PackagesTable';
import { TabsContent } from '@/components/ui/tabs';

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
  onUpdate,
}: DashboardTabProps) {
  return (
    <TabsContent value="dashboard" className="space-y-4 sm:space-y-8 px-2 sm:px-0">
      <StatsGrid 
        packageStats={packageStats}
        customersCount={customersCount}
      />
      <QuickActions 
        onNewPackage={onNewPackage}
        onNewTrip={onNewTrip}
        onViewNotifications={onViewNotifications}
      />
      <PackagesTable 
        packages={packages}
        filteredPackages={filteredPackages}
        isLoading={isLoading}
        onUpdate={onUpdate}
      />
    </TabsContent>
  );
}
