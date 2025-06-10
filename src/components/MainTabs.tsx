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
}

export function MainTabs({ previewRole }: MainTabsProps) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { data: userRole } = useCurrentUserRoleWithPreview(previewRole);
  const { unreadCount } = useUnreadMessages();

  const [activeTab, setActiveTab] = useState('dashboard');
  const { data: userRole } = useCurrentUserRoleWithPreview(previewRole);
  const { unreadCount } = useUnreadMessages();

  if (!userRole) {
    return <div>Cargando...</div>;
  }

  const isAdmin = userRole.role === 'admin';
  const isAdminOrEmployee = userRole.role === 'admin' || userRole.role === 'employee';

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
            <TabsTrigger value="dispatches">Despachos</TabsTrigger>
            <TabsTrigger value="finances">Finanzas</TabsTrigger>
            <TabsTrigger value="customers">Clientes</TabsTrigger>
          </>
        )}
        
        {isAdmin && (
          <>
            <TabsTrigger value="chat" className="relative">
              Chat
              {unreadCount > 0 && (
                <NotificationBadge count={unreadCount} />
              )}
            </TabsTrigger>
            <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
            <TabsTrigger value="users">Usuarios</TabsTrigger>
            <TabsTrigger value="investigation">Investigación</TabsTrigger>
            <TabsTrigger value="settings">Configuración</TabsTrigger>
            <TabsTrigger value="developer">Desarrollador</TabsTrigger>
          </>
        )}
      </TabsList>

      <TabsContent value="dashboard">
        <DashboardTab />
      </TabsContent>

      {isAdminOrEmployee && (
        <>
          <TabsContent value="packages">
            <PackagesByDateView previewRole={previewRole} />
          </TabsContent>

          <TabsContent value="trips">
            <TripsTab />
          </TabsContent>

          <TabsContent value="dispatches">
            <DispatchesTab />
          </TabsContent>

          <TabsContent value="finances">
            <FinancesTab />
          </TabsContent>

          <TabsContent value="customers">
            <CustomersTab />
          </TabsContent>
        </>
      )}

      {isAdmin && (
        <>
          <TabsContent value="chat">
            <ChatTab />
          </TabsContent>

          <TabsContent value="notifications">
            <NotificationsTab />
          </TabsContent>

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
