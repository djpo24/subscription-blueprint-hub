import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DashboardTab } from './tabs/DashboardTab';
import { PackagesTab } from './tabs/PackagesTab';
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
}

export function MainTabs({ activeTab, onTabChange }: MainTabsProps) {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="flex-1 flex flex-col">
      <TabsList>
        <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
        <TabsTrigger value="packages">Encomiendas</TabsTrigger>
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
        <DashboardTab />
        <PackagesTab />
        <TripsTab />
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
