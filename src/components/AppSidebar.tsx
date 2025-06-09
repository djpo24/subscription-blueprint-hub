
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import { useCurrentUserRoleWithPreview } from '@/hooks/useCurrentUserRoleWithPreview';
import { SidebarLoadingState } from './sidebar/SidebarLoadingState';
import { SidebarMenuSection } from './sidebar/SidebarMenuSection';
import { createMenuItems } from './sidebar/SidebarMenuItems';

interface AppSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  unreadCount?: number;
  previewRole?: 'admin' | 'employee' | 'traveler';
}

export function AppSidebar({ activeTab, onTabChange, unreadCount = 0, previewRole }: AppSidebarProps) {
  const { data: userRole, isLoading } = useCurrentUserRoleWithPreview(previewRole);
  
  // Show tabs based on user role
  const showUsersTab = userRole?.role === 'admin';
  const showNotificationsTab = userRole?.role === 'admin';
  const showSettingsTab = userRole?.role === 'admin';
  const showChatTab = userRole?.role === 'admin';
  const showFinancesTab = userRole?.role === 'admin';

  if (isLoading) {
    return <SidebarLoadingState />;
  }

  const menuItems = createMenuItems(
    showUsersTab,
    showNotificationsTab,
    showSettingsTab,
    showChatTab,
    showFinancesTab,
    unreadCount
  );

  return (
    <Sidebar className="bg-black border-gray-800" collapsible="icon">
      <SidebarContent className="bg-black">
        <SidebarGroup>
          <SidebarGroupLabel className="text-white font-bold text-lg px-4 py-6">
            Envíos Ojitos
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenuSection 
              menuItems={menuItems}
              activeTab={activeTab}
              onTabChange={onTabChange}
            />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
