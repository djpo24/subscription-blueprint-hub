
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DashboardTab } from './tabs/DashboardTab';
import { TripsTab } from './tabs/TripsTab';
import { DispatchesTab } from './tabs/DispatchesTab';
import { NotificationsTab } from './tabs/NotificationsTab';
import { FinancesTab } from './tabs/FinancesTab';
import { CustomersTab } from './tabs/CustomersTab';
import { DeveloperTab } from './tabs/DeveloperTab';
import { AdminInvestigationTab } from './tabs/AdminInvestigationTab';
import { ChatTab } from './tabs/ChatTab';

interface MainTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  // Optional props for different contexts
  packageStats?: any;
  customersCount?: number;
  onNewPackage?: () => void;
  onNewTrip?: () => void;
  onViewNotifications?: () => void;
  onMobileDelivery?: () => void;
  packages?: any[];
  filteredPackages?: any[];
  isLoading?: boolean;
  onUpdate?: (id: string, updates: any) => void;
  viewingPackagesByDate?: Date | null;
  trips?: any[];
  tripsLoading?: boolean;
  onAddPackage?: (tripId: string) => void;
  onCreateTrip?: (date: Date) => void;
  onViewPackagesByDate?: (date: Date) => void;
  onBack?: () => void;
  disableChat?: boolean;
  previewRole?: 'admin' | 'employee' | 'traveler';
}

export function MainTabs({ 
  activeTab, 
  onTabChange,
  packageStats = { total: 0, recibido: 0, bodega: 0, procesado: 0, transito: 0, en_destino: 0, delivered: 0, pending: 0, inTransit: 0 },
  customersCount = 0,
  onNewPackage = () => {},
  onNewTrip = () => {},
  onViewNotifications = () => {},
  onMobileDelivery = () => {},
  packages = [],
  filteredPackages = [],
  isLoading = false,
  onUpdate = () => {},
  viewingPackagesByDate = null,
  trips = [],
  tripsLoading = false,
  onAddPackage = () => {},
  onCreateTrip = () => {},
  onViewPackagesByDate = () => {},
  onBack = () => {},
  disableChat = false,
  previewRole
}: MainTabsProps) {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="flex-1 flex flex-col">
      <TabsList>
        <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
        <TabsTrigger value="trips">Viajes</TabsTrigger>
        <TabsTrigger value="dispatches">Despachos</TabsTrigger>
        <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
        <TabsTrigger value="finances">Finanzas</TabsTrigger>
        <TabsTrigger value="customers">Clientes</TabsTrigger>
        <TabsTrigger value="chat">Chat</TabsTrigger>
        <TabsTrigger value="developer">Developer</TabsTrigger>
        <TabsTrigger value="admin-investigation">Admin</TabsTrigger>
      </TabsList>
      
      <div className="flex-1 min-h-0">
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
        <DispatchesTab />
        <NotificationsTab />
        <FinancesTab />
        <CustomersTab />
        <ChatTab />
        <DeveloperTab />
        <AdminInvestigationTab />
      </div>
    </Tabs>
  );
}
