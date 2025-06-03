
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useIsMobile } from '@/hooks/use-mobile';
import { useCurrentUserRoleWithPreview } from '@/hooks/useCurrentUserRoleWithPreview';

interface MainTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  unreadCount?: number;
  previewRole?: 'admin' | 'employee' | 'traveler';
}

export function MainTabs({ activeTab, onTabChange, unreadCount = 0, previewRole }: MainTabsProps) {
  const isMobile = useIsMobile();
  const { data: userRole, isLoading, error } = useCurrentUserRoleWithPreview(previewRole);
  
  console.log('MainTabs: userRole data:', userRole);
  console.log('MainTabs: isLoading:', isLoading);
  console.log('MainTabs: error:', error);
  console.log('MainTabs: previewRole:', previewRole);
  
  // Show Users tab only for admins
  const showUsersTab = userRole?.role === 'admin';
  
  // Hide notifications and settings for travelers and employees
  const showNotificationsTab = userRole?.role === 'admin';
  const showSettingsTab = userRole?.role === 'admin';
  
  // Hide chat and debtors for employees and travelers (only admins can access)
  const showChatTab = userRole?.role === 'admin';
  const showDebtorsTab = userRole?.role === 'admin';
  
  console.log('MainTabs: showUsersTab:', showUsersTab);
  console.log('MainTabs: showNotificationsTab:', showNotificationsTab);
  console.log('MainTabs: showSettingsTab:', showSettingsTab);
  console.log('MainTabs: showChatTab:', showChatTab);
  console.log('MainTabs: showDebtorsTab:', showDebtorsTab);

  if (isLoading) {
    console.log('MainTabs: Still loading user role...');
    return (
      <div className="w-full h-10 bg-gray-200 animate-pulse rounded-md"></div>
    );
  }

  if (error) {
    console.error('MainTabs: Error loading user role:', error);
  }

  // Calculate grid columns dynamically based on visible tabs
  const visibleTabsCount = [
    true, // dashboard
    true, // trips
    true, // dispatches
    showDebtorsTab,
    showChatTab,
    showNotificationsTab,
    showUsersTab,
    showSettingsTab,
    true // developer (always visible)
  ].filter(Boolean).length;

  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList className={`grid w-full gap-0.5 sm:gap-1 h-auto p-1 overflow-x-auto`} style={{ gridTemplateColumns: `repeat(${visibleTabsCount}, minmax(0, 1fr))` }}>
        <TabsTrigger value="dashboard" className="text-xs sm:text-sm px-1 sm:px-3 py-2 min-w-0 flex-shrink-0">
          {isMobile ? "Home" : "Dashboard"}
        </TabsTrigger>
        <TabsTrigger value="trips" className="text-xs sm:text-sm px-1 sm:px-3 py-2 min-w-0 flex-shrink-0">
          {isMobile ? "Viajes" : "Viajes"}
        </TabsTrigger>
        <TabsTrigger value="dispatches" className="text-xs sm:text-sm px-1 sm:px-3 py-2 min-w-0 flex-shrink-0">
          {isMobile ? "Desp." : "Despachos"}
        </TabsTrigger>
        {showDebtorsTab && (
          <TabsTrigger value="debtors" className="text-xs sm:text-sm px-1 sm:px-3 py-2 min-w-0 flex-shrink-0">
            {isMobile ? "Deudas" : "Deudores"}
          </TabsTrigger>
        )}
        {showChatTab && (
          <TabsTrigger value="chat" className="text-xs sm:text-sm px-1 sm:px-3 py-2 relative min-w-0 flex-shrink-0">
            {isMobile ? "Chat" : "Chat"}
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-1 sm:ml-2 h-4 w-4 sm:h-5 sm:w-5 rounded-full p-0 text-xs absolute -top-1 -right-1 sm:relative sm:top-auto sm:right-auto">
                {unreadCount > 9 ? '9+' : unreadCount}
              </Badge>
            )}
          </TabsTrigger>
        )}
        {showNotificationsTab && (
          <TabsTrigger value="notifications" className="text-xs sm:text-sm px-1 sm:px-3 py-2 min-w-0 flex-shrink-0">
            {isMobile ? "Notif." : "Notificaciones"}
          </TabsTrigger>
        )}
        {showUsersTab && (
          <TabsTrigger value="users" className="text-xs sm:text-sm px-1 sm:px-3 py-2 min-w-0 flex-shrink-0">
            {isMobile ? "Users" : "Usuarios"}
          </TabsTrigger>
        )}
        {showSettingsTab && (
          <TabsTrigger value="settings" className="text-xs sm:text-sm px-1 sm:px-3 py-2 min-w-0 flex-shrink-0">
            {isMobile ? "Config" : "Configuración"}
          </TabsTrigger>
        )}
        <TabsTrigger value="developer" className="text-xs sm:text-sm px-1 sm:px-3 py-2 min-w-0 flex-shrink-0 bg-purple-100 text-purple-800">
          {isMobile ? "Dev" : "Preview"}
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
