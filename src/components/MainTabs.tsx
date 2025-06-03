
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useIsMobile } from '@/hooks/use-mobile';
import { useCurrentUserRole } from '@/hooks/useCurrentUserRole';

interface MainTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  unreadCount?: number;
}

export function MainTabs({ activeTab, onTabChange, unreadCount = 0 }: MainTabsProps) {
  const isMobile = useIsMobile();
  const { role, isLoading } = useCurrentUserRole();
  
  // Show Users tab only for admins
  const showUsersTab = role === 'admin';
  
  // Calculate grid columns based on number of tabs
  const totalTabs = showUsersTab ? 8 : 7;
  const gridCols = isMobile ? 'grid-cols-4' : `grid-cols-${totalTabs}`;

  if (isLoading) {
    return (
      <div className="w-full h-10 bg-gray-200 animate-pulse rounded-md"></div>
    );
  }

  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList className={`grid w-full ${gridCols} gap-0.5 sm:gap-1 h-auto p-1 overflow-x-auto`}>
        <TabsTrigger value="dashboard" className="text-xs sm:text-sm px-1 sm:px-3 py-2 min-w-0 flex-shrink-0">
          {isMobile ? "Home" : "Dashboard"}
        </TabsTrigger>
        <TabsTrigger value="trips" className="text-xs sm:text-sm px-1 sm:px-3 py-2 min-w-0 flex-shrink-0">
          {isMobile ? "Viajes" : "Viajes"}
        </TabsTrigger>
        <TabsTrigger value="dispatches" className="text-xs sm:text-sm px-1 sm:px-3 py-2 min-w-0 flex-shrink-0">
          {isMobile ? "Desp." : "Despachos"}
        </TabsTrigger>
        <TabsTrigger value="debtors" className="text-xs sm:text-sm px-1 sm:px-3 py-2 min-w-0 flex-shrink-0">
          {isMobile ? "Deudas" : "Deudores"}
        </TabsTrigger>
        <TabsTrigger value="chat" className="text-xs sm:text-sm px-1 sm:px-3 py-2 relative min-w-0 flex-shrink-0">
          {isMobile ? "Chat" : "Chat"}
          {unreadCount > 0 && (
            <Badge variant="destructive" className="ml-1 sm:ml-2 h-4 w-4 sm:h-5 sm:w-5 rounded-full p-0 text-xs absolute -top-1 -right-1 sm:relative sm:top-auto sm:right-auto">
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="notifications" className="text-xs sm:text-sm px-1 sm:px-3 py-2 min-w-0 flex-shrink-0">
          {isMobile ? "Notif." : "Notificaciones"}
        </TabsTrigger>
        {showUsersTab && (
          <TabsTrigger value="users" className="text-xs sm:text-sm px-1 sm:px-3 py-2 min-w-0 flex-shrink-0">
            {isMobile ? "Users" : "Usuarios"}
          </TabsTrigger>
        )}
        <TabsTrigger value="settings" className="text-xs sm:text-sm px-1 sm:px-3 py-2 min-w-0 flex-shrink-0">
          {isMobile ? "Config" : "Configuración"}
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
