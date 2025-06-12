
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';
import { DashboardTab } from './tabs/DashboardTab';
import { PackagesByDateView } from './PackagesByDateView';
import { TripsTab } from './tabs/TripsTab';
import { DispatchesTab } from './tabs/DispatchesTab';
import { FinancesTab } from './tabs/FinancesTab';
import { CustomersTab } from './tabs/CustomersTab';
import { ChatTab } from './tabs/ChatTab';
import { NotificationsTab } from './tabs/NotificationsTab';
import { SettingsTab } from './tabs/SettingsTab';
import { DeveloperTab } from './tabs/DeveloperTab';
import { UsersTab } from './tabs/UsersTab';
import { AdminInvestigationTab } from './tabs/AdminInvestigationTab';
import { useCurrentUserRoleWithPreview } from '@/hooks/useCurrentUserRoleWithPreview';
import { useUnreadMessages } from '@/hooks/useUnreadMessages';
import { Badge } from '@/components/ui/badge';
import { NotificationBadge } from '@/components/ui/notification-badge';

interface MainTabsProps {
  previewRole?: 'admin' | 'employee' | 'traveler';
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  unreadCount?: number;
  // Props for DashboardTab
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
  // Props for TripsTab
  viewingPackagesByDate?: Date | null;
  trips?: any[];
  tripsLoading?: boolean;
  onAddPackage?: (tripId: string) => void;
  onCreateTrip?: (date: Date) => void;
  onViewPackagesByDate?: (date: Date) => void;
  onBack?: () => void;
  // Props for PackagesByDateView
  selectedDate?: Date;
}

export function MainTabs({ 
  previewRole,
  activeTab: externalActiveTab,
  onTabChange: externalOnTabChange,
  unreadCount: externalUnreadCount,
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
  viewingPackagesByDate,
  trips,
  tripsLoading,
  onAddPackage,
  onCreateTrip,
  onViewPackagesByDate,
  onBack,
  selectedDate
}: MainTabsProps) {
  const [internalActiveTab, setInternalActiveTab] = useState('dashboard');
  const { data: userRole } = useCurrentUserRoleWithPreview(previewRole);
  const { unreadCount: internalUnreadCount } = useUnreadMessages();

  // Use external values if provided, otherwise use internal ones
  const activeTab = externalActiveTab || internalActiveTab;
  const setActiveTab = externalOnTabChange || setInternalActiveTab;
  const unreadCount = externalUnreadCount !== undefined ? externalUnreadCount : internalUnreadCount;

  if (!userRole) {
    return <div>Cargando...</div>;
  }

  const isAdmin = userRole.role === 'admin';
  // Updated: Employees and travelers can now access all main features
  const isAdminOrEmployee = userRole.role === 'admin' || userRole.role === 'employee' || userRole.role === 'traveler';
  // Updated: Travelers can now access dispatches and notifications
  const canAccessDispatches = userRole.role === 'admin' || userRole.role === 'employee' || userRole.role === 'traveler';
  const canAccessNotifications = userRole.role === 'admin' || userRole.role === 'traveler';
  // Updated: Chat is now available for admin, employee and traveler
  const canAccessChat = userRole.role === 'admin' || userRole.role === 'employee' || userRole.role === 'traveler';
  // Updated: Finances is now available for admin, employee and traveler
  const canAccessFinances = userRole.role === 'admin' || userRole.role === 'employee' || userRole.role === 'traveler';

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    
    // Marcar chat como visitado cuando se cambia a la pestaña de chat
    if (value === 'chat') {
      localStorage.setItem('chat-last-visited', new Date().toISOString());
    }
  };

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
      <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
        <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
        
        {isAdminOrEmployee && (
          <>
            <TabsTrigger value="packages">Encomiendas</TabsTrigger>
            <TabsTrigger value="trips">Viajes</TabsTrigger>
          </>
        )}
        
        {canAccessDispatches && (
          <TabsTrigger value="dispatches">Despachos</TabsTrigger>
        )}
        
        {canAccessFinances && (
          <TabsTrigger value="finances">Finanzas</TabsTrigger>
        )}
        
        {isAdminOrEmployee && (
          <TabsTrigger value="customers">Clientes</TabsTrigger>
        )}
        
        {canAccessChat && !disableChat && (
          <TabsTrigger value="chat" className="relative">
            Chat
            {unreadCount > 0 && (
              <NotificationBadge count={unreadCount} />
            )}
          </TabsTrigger>
        )}
        
        {canAccessNotifications && (
          <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
        )}
        
        {isAdmin && (
          <>
            <TabsTrigger value="users">Usuarios</TabsTrigger>
            <TabsTrigger value="investigation">Investigación</TabsTrigger>
            <TabsTrigger value="settings">Configuración</TabsTrigger>
            <TabsTrigger value="developer">Desarrollador</TabsTrigger>
          </>
        )}
      </TabsList>

      <TabsContent value="dashboard">
        <DashboardTab
          packageStats={packageStats || { total: 0, recibido: 0, bodega: 0, procesado: 0, transito: 0, en_destino: 0, delivered: 0, pending: 0, inTransit: 0 }}
          customersCount={customersCount || 0}
          onNewPackage={onNewPackage || (() => {})}
          onNewTrip={onNewTrip || (() => {})}
          onViewNotifications={onViewNotifications || (() => {})}
          onMobileDelivery={onMobileDelivery || (() => {})}
          packages={packages || []}
          filteredPackages={filteredPackages || []}
          isLoading={isLoading || false}
          onUpdate={onUpdate || (() => {})}
          disableChat={disableChat}
          previewRole={previewRole}
          onTabChange={setActiveTab}
        />
      </TabsContent>

      {isAdminOrEmployee && (
        <>
          <TabsContent value="packages">
            {selectedDate && onBack && onAddPackage ? (
              <PackagesByDateView 
                selectedDate={selectedDate}
                onBack={onBack}
                onAddPackage={onAddPackage}
                previewRole={previewRole}
                disableChat={disableChat}
              />
            ) : (
              <div>Seleccione una fecha para ver las encomiendas</div>
            )}
          </TabsContent>

          <TabsContent value="trips">
            <TripsTab
              viewingPackagesByDate={viewingPackagesByDate}
              trips={trips || []}
              tripsLoading={tripsLoading || false}
              onAddPackage={onAddPackage || (() => {})}
              onCreateTrip={onCreateTrip || (() => {})}
              onViewPackagesByDate={onViewPackagesByDate || (() => {})}
              onBack={onBack || (() => {})}
              disableChat={disableChat}
              previewRole={previewRole}
            />
          </TabsContent>

          <TabsContent value="customers">
            <CustomersTab />
          </TabsContent>
        </>
      )}

      {canAccessDispatches && (
        <TabsContent value="dispatches">
          <DispatchesTab />
        </TabsContent>
      )}

      {canAccessFinances && (
        <TabsContent value="finances">
          <FinancesTab />
        </TabsContent>
      )}

      {canAccessChat && !disableChat && (
        <TabsContent value="chat">
          <ChatTab />
        </TabsContent>
      )}

      {canAccessNotifications && (
        <TabsContent value="notifications">
          <NotificationsTab />
        </TabsContent>
      )}

      {isAdmin && (
        <>
          <TabsContent value="users">
            <UsersTab />
          </TabsContent>

          <TabsContent value="investigation">
            <AdminInvestigationTab />
          </TabsContent>

          <TabsContent value="settings">
            <SettingsTab />
          </TabsContent>

          <TabsContent value="developer">
            <DeveloperTab />
          </TabsContent>
        </>
      )}
    </Tabs>
  );
}
