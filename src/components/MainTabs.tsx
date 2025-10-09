
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DashboardTab } from './tabs/DashboardTab';
import { CustomersTab } from './tabs/CustomersTab';
import { FinancesTab } from './tabs/FinancesTab';
import { DispatchesTab } from './tabs/DispatchesTab';
import { ChatTab } from './tabs/ChatTab';
import { TripsTab } from './tabs/TripsTab';
import { NotificationsTab } from './tabs/NotificationsTab';
import { SettingsTab } from './tabs/SettingsTab';
import { MarketingTab } from './tabs/MarketingTab';
import { UsersTab } from './tabs/UsersTab';
import { DeveloperTab } from './tabs/DeveloperTab';
import { AdminInvestigationTab } from './tabs/AdminInvestigationTab';
import { DeletedPackagesTab } from './tabs/DeletedPackagesTab';
import { useCurrentUserRoleWithPreview } from '@/hooks/useCurrentUserRoleWithPreview';
import { 
  BarChart3, 
  Users, 
  DollarSign, 
  Truck, 
  MessageSquare, 
  MapPin, 
  Bell,
  Settings,
  Megaphone,
  Shield,
  Code,
  Search,
  Trash2
} from 'lucide-react';

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
  onUpdate?: (id: string, updates: any) => void;
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
  unreadCount = 0,
  previewRole,
  packageStats,
  customersCount,
  onNewPackage,
  onNewTrip,
  onViewNotifications,
  onMobileDelivery,
  packages = [],
  filteredPackages = [],
  isLoading = false,
  onUpdate,
  disableChat = false,
  viewingPackagesByDate,
  trips = [],
  tripsLoading = false,
  onAddPackage,
  onCreateTrip,
  onViewPackagesByDate,
  onBack,
  selectedDate
}: MainTabsProps) {
  const { data: userRole } = useCurrentUserRoleWithPreview(previewRole);
  const effectiveRole = userRole?.role || 'employee';

  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 xl:grid-cols-12 gap-1 h-auto p-1">
        <TabsTrigger value="dashboard" className="flex items-center gap-2 py-2 px-3">
          <BarChart3 className="h-4 w-4" />
          <span className="hidden sm:inline">Panel</span>
        </TabsTrigger>
        
        <TabsTrigger value="customers" className="flex items-center gap-2 py-2 px-3">
          <Users className="h-4 w-4" />
          <span className="hidden sm:inline">Clientes</span>
        </TabsTrigger>
        
        <TabsTrigger value="finances" className="flex items-center gap-2 py-2 px-3">
          <DollarSign className="h-4 w-4" />
          <span className="hidden sm:inline">Finanzas</span>
        </TabsTrigger>
        
        <TabsTrigger value="dispatches" className="flex items-center gap-2 py-2 px-3">
          <Truck className="h-4 w-4" />
          <span className="hidden sm:inline">Despachos</span>
        </TabsTrigger>
        
        <TabsTrigger value="chat" className="flex items-center gap-2 py-2 px-3">
          <MessageSquare className="h-4 w-4" />
          <span className="hidden sm:inline">Chat</span>
        </TabsTrigger>
        
        <TabsTrigger value="trips" className="flex items-center gap-2 py-2 px-3">
          <MapPin className="h-4 w-4" />
          <span className="hidden sm:inline">Viajes</span>
        </TabsTrigger>
        
        <TabsTrigger value="marketing" className="flex items-center gap-2 py-2 px-3">
          <Megaphone className="h-4 w-4" />
          <span className="hidden sm:inline">Marketing</span>
        </TabsTrigger>
        
        <TabsTrigger value="notifications" className="flex items-center gap-2 py-2 px-3">
          <Bell className="h-4 w-4" />
          <span className="hidden sm:inline">Notificaciones</span>
        </TabsTrigger>
        
        <TabsTrigger value="settings" className="flex items-center gap-2 py-2 px-3">
          <Settings className="h-4 w-4" />
          <span className="hidden sm:inline">Configuración</span>
        </TabsTrigger>
        
        {effectiveRole === 'admin' && (
          <>
            <TabsTrigger value="users" className="flex items-center gap-2 py-2 px-3">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Usuarios</span>
            </TabsTrigger>
            
            <TabsTrigger value="developer" className="flex items-center gap-2 py-2 px-3">
              <Code className="h-4 w-4" />
              <span className="hidden sm:inline">Desarrollo</span>
            </TabsTrigger>
            
            <TabsTrigger value="admin-investigation" className="flex items-center gap-2 py-2 px-3">
              <Search className="h-4 w-4" />
              <span className="hidden sm:inline">Investigación</span>
            </TabsTrigger>
            
            <TabsTrigger value="deleted-packages" className="flex items-center gap-2 py-2 px-3">
              <Trash2 className="h-4 w-4" />
              <span className="hidden sm:inline">Eliminados</span>
            </TabsTrigger>
          </>
        )}
      </TabsList>

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
        onTabChange={onTabChange}
      />
      <CustomersTab />
      <FinancesTab />
      <DispatchesTab />
      <ChatTab />
      <TripsTab 
        viewingPackagesByDate={viewingPackagesByDate}
        trips={trips}
        tripsLoading={tripsLoading}
        onAddPackage={onAddPackage}
        onCreateTrip={onCreateTrip}
        onViewPackagesByDate={onViewPackagesByDate}
        onBack={onBack}
      />
      <MarketingTab />
      <NotificationsTab />
      <SettingsTab />
      
      {effectiveRole === 'admin' && (
        <>
          <UsersTab />
          <DeveloperTab />
          <AdminInvestigationTab />
          <DeletedPackagesTab />
        </>
      )}
    </Tabs>
  );
}
