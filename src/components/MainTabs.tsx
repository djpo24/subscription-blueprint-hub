
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NotificationsTab } from '@/components/tabs/NotificationsTab';
import { CampaignNotificationsPanel } from '@/components/campaign/CampaignNotificationsPanel';
import { DashboardTab } from '@/components/tabs/DashboardTab';
import { TripsTab } from '@/components/tabs/TripsTab';
import { DispatchesTab } from '@/components/tabs/DispatchesTab';

interface MainTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  unreadCount?: number;
  previewRole?: 'admin' | 'employee' | 'traveler';
  packageStats?: any;
  customersCount?: number;
  onNewPackage?: () => void;
  onNewTrip?: () => void;
  onViewNotifications?: () => void;
  onMobileDelivery?: () => void;
  packages?: any[];
  filteredPackages?: any[];
  isLoading?: boolean;
  onUpdate?: () => void;
  disableChat?: boolean;
  viewingPackagesByDate?: Date | null;
  trips?: any[];
  tripsLoading?: boolean;
  onAddPackage?: (tripId: string) => void;
  onCreateTrip?: (date: Date) => void;
  onViewPackagesByDate?: (date: Date) => void;
  onBack?: () => void;
  selectedDate?: Date;
}

export function MainTabs({ 
  activeTab, 
  onTabChange, 
  unreadCount,
  previewRole,
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
  disableChat,
  viewingPackagesByDate,
  trips,
  tripsLoading,
  onAddPackage,
  onCreateTrip,
  onViewPackagesByDate,
  onBack,
  selectedDate
}: MainTabsProps) {
  return (
    <div className="p-4 sm:p-6">
      <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="trips">Viajes</TabsTrigger>
          <TabsTrigger value="dispatches">Despachos</TabsTrigger>
          <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
          <TabsTrigger value="campaign">Campaña</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <DashboardTab
            packageStats={packageStats}
            customersCount={customersCount}
            onNewPackage={onNewPackage}
            onNewTrip={onNewTrip}
            onViewNotifications={onViewNotifications}
            onMobileDelivery={onMobileDelivery}
            packages={packages}
            filteredPackages={filteredPackages}
            isLoading={isLoading}
            onUpdate={onUpdate}
            disableChat={disableChat}
            previewRole={previewRole}
            onTabChange={onTabChange}
          />
        </TabsContent>

        <TabsContent value="trips">
          <TripsTab
            viewingPackagesByDate={viewingPackagesByDate}
            trips={trips}
            tripsLoading={tripsLoading}
            onAddPackage={onAddPackage}
            onCreateTrip={onCreateTrip}
            onViewPackagesByDate={onViewPackagesByDate}
            onBack={onBack}
            disableChat={disableChat}
            previewRole={previewRole}
          />
        </TabsContent>

        <TabsContent value="dispatches">
          <DispatchesTab />
        </TabsContent>

        <TabsContent value="notifications">
          <NotificationsTab />
        </TabsContent>

        <TabsContent value="campaign">
          <CampaignNotificationsPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
