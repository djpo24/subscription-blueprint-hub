
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
  
  // Hide chat and finances for employees and travelers (only admins can access)
  const showChatTab = userRole?.role === 'admin';
  const showFinancesTab = userRole?.role === 'admin';
  
  // Customers is now visible for ALL users
  const showCustomersTab = true;
  
  console.log('MainTabs: showUsersTab:', showUsersTab);
  console.log('MainTabs: showNotificationsTab:', showNotificationsTab);
  console.log('MainTabs: showSettingsTab:', showSettingsTab);
  console.log('MainTabs: showChatTab:', showChatTab);
  console.log('MainTabs: showFinancesTab:', showFinancesTab);
  console.log('MainTabs: showCustomersTab:', showCustomersTab);

  if (isLoading) {
    console.log('MainTabs: Still loading user role...');
    return (
      <div className="w-full h-8 sm:h-10 bg-gray-200 animate-pulse rounded-md"></div>
    );
  }

  if (error) {
    console.error('MainTabs: Error loading user role:', error);
  }

  // Calculate visible tabs
  const visibleTabs = [
    { value: 'dashboard', label: isMobile ? 'Home' : 'Dashboard', show: true },
    { value: 'trips', label: 'Viajes', show: true },
    { value: 'dispatches', label: isMobile ? 'Desp.' : 'Despachos', show: true },
    { value: 'finances', label: 'Finanzas', show: showFinancesTab },
    { value: 'chat', label: 'Chat', show: showChatTab, hasNotification: unreadCount > 0 },
    { value: 'notifications', label: isMobile ? 'Notif.' : 'Notificaciones', show: showNotificationsTab },
    { value: 'customers', label: 'Clientes', show: showCustomersTab },
    { value: 'users', label: isMobile ? 'Users' : 'Usuarios', show: showUsersTab },
    { value: 'settings', label: isMobile ? 'Config' : 'Configuración', show: showSettingsTab },
    { value: 'developer', label: isMobile ? 'Dev' : 'Preview', show: true, special: true }
  ].filter(tab => tab.show);

  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="grid w-full gap-0.5 sm:gap-1 h-auto p-1 overflow-x-auto bg-muted" 
        style={{ gridTemplateColumns: `repeat(${visibleTabs.length}, minmax(0, 1fr))` }}>
        {visibleTabs.map((tab) => (
          <TabsTrigger 
            key={tab.value}
            value={tab.value} 
            className={`text-xs sm:text-sm px-1 sm:px-2 lg:px-3 py-1.5 sm:py-2 min-w-0 flex-shrink-0 whitespace-nowrap relative ${
              tab.special ? 'bg-purple-100 text-purple-800 data-[state=active]:bg-purple-200' : ''
            }`}
          >
            {tab.label}
            {tab.hasNotification && (
              <Badge 
                variant="destructive" 
                className="ml-1 h-3 w-3 sm:h-4 sm:w-4 rounded-full p-0 text-xs absolute -top-1 -right-1 sm:relative sm:top-auto sm:right-auto sm:ml-2"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </Badge>
            )}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
