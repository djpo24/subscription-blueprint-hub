
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NotificationBadge } from '@/components/ui/notification-badge';
import { DashboardTab } from './tabs/DashboardTab';
import { TripsTab } from './tabs/TripsTab';
import { DispatchesTab } from './tabs/DispatchesTab';
import { ChatTab } from './tabs/ChatTab';
import { NotificationsTab } from './tabs/NotificationsTab';
import { SettingsTab } from './tabs/SettingsTab';

interface MainTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  unreadCount: number;
  packageStats: any;
  customersCount: number;
  onNewPackage: () => void;
  onNewTrip: () => void;
  onViewNotifications: () => void;
  packages: any[];
  filteredPackages: any[];
  packagesLoading: boolean;
  onPackagesUpdate: () => void;
  viewingPackagesByDate: Date | null;
  trips: any[];
  tripsLoading: boolean;
  onAddPackage: (tripId: string) => void;
  onCreateTrip: (date: Date) => void;
  onViewPackagesByDate: (date: Date) => void;
  onBackToCalendar: () => void;
}

export function MainTabs({
  activeTab,
  setActiveTab,
  unreadCount,
  packageStats,
  customersCount,
  onNewPackage,
  onNewTrip,
  onViewNotifications,
  packages,
  filteredPackages,
  packagesLoading,
  onPackagesUpdate,
  viewingPackagesByDate,
  trips,
  tripsLoading,
  onAddPackage,
  onCreateTrip,
  onViewPackagesByDate,
  onBackToCalendar,
}: MainTabsProps) {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="grid w-full grid-cols-6">
        <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
        <TabsTrigger value="trips">Viajes</TabsTrigger>
        <TabsTrigger value="dispatches">Despachos</TabsTrigger>
        <TabsTrigger value="chat" className="relative">
          Chat
          <NotificationBadge count={unreadCount} />
        </TabsTrigger>
        <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
        <TabsTrigger value="settings">Configuración</TabsTrigger>
      </TabsList>
      
      <DashboardTab
        packageStats={packageStats}
        customersCount={customersCount}
        onNewPackage={onNewPackage}
        onNewTrip={onNewTrip}
        onViewNotifications={onViewNotifications}
        packages={packages}
        filteredPackages={filteredPackages}
        isLoading={packagesLoading}
        onUpdate={onPackagesUpdate}
      />
      
      <TripsTab
        viewingPackagesByDate={viewingPackagesByDate}
        trips={trips}
        tripsLoading={tripsLoading}
        onAddPackage={onAddPackage}
        onCreateTrip={onCreateTrip}
        onViewPackagesByDate={onViewPackagesByDate}
        onBack={onBackToCalendar}
      />
      
      <DispatchesTab />
      <ChatTab />
      <NotificationsTab />
      <SettingsTab />
    </Tabs>
  );
}
