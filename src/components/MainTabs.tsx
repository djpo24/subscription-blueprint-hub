
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

interface MainTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  unreadCount?: number;
}

export function MainTabs({ activeTab, onTabChange, unreadCount = 0 }: MainTabsProps) {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="grid w-full grid-cols-7">
        <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
        <TabsTrigger value="trips">Viajes</TabsTrigger>
        <TabsTrigger value="dispatches">Despachos</TabsTrigger>
        <TabsTrigger value="debtors">Deudores</TabsTrigger>
        <TabsTrigger value="chat">
          Chat
          {unreadCount > 0 && (
            <Badge variant="destructive" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
        <TabsTrigger value="settings">Configuración</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
