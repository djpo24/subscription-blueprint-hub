
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useIsMobile } from '@/hooks/use-mobile';

interface MainTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  unreadCount?: number;
}

export function MainTabs({ activeTab, onTabChange, unreadCount = 0 }: MainTabsProps) {
  const isMobile = useIsMobile();

  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="grid w-full grid-cols-4 sm:grid-cols-7 gap-1 h-auto p-1">
        <TabsTrigger value="dashboard" className="text-xs sm:text-sm px-1 sm:px-3 py-2">
          {isMobile ? "Home" : "Dashboard"}
        </TabsTrigger>
        <TabsTrigger value="trips" className="text-xs sm:text-sm px-1 sm:px-3 py-2">
          Viajes
        </TabsTrigger>
        <TabsTrigger value="dispatches" className="text-xs sm:text-sm px-1 sm:px-3 py-2 hidden sm:block">
          {isMobile ? "Desp." : "Despachos"}
        </TabsTrigger>
        <TabsTrigger value="debtors" className="text-xs sm:text-sm px-1 sm:px-3 py-2">
          {isMobile ? "Deudas" : "Deudores"}
        </TabsTrigger>
        <TabsTrigger value="chat" className="text-xs sm:text-sm px-1 sm:px-3 py-2 relative">
          Chat
          {unreadCount > 0 && (
            <Badge variant="destructive" className="ml-1 sm:ml-2 h-4 w-4 sm:h-5 sm:w-5 rounded-full p-0 text-xs absolute -top-1 -right-1 sm:relative sm:top-auto sm:right-auto">
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="notifications" className="text-xs sm:text-sm px-1 sm:px-3 py-2 hidden sm:block">
          {isMobile ? "Notif." : "Notificaciones"}
        </TabsTrigger>
        <TabsTrigger value="settings" className="text-xs sm:text-sm px-1 sm:px-3 py-2 hidden sm:block">
          {isMobile ? "Config" : "Configuración"}
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
