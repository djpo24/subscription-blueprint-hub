
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, useSidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
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

export function AppSidebar({
  activeTab,
  onTabChange,
  unreadCount = 0,
  previewRole
}: AppSidebarProps) {
  const {
    data: userRole,
    isLoading
  } = useCurrentUserRoleWithPreview(previewRole);
  const {
    state,
    toggleSidebar
  } = useSidebar();

  // Show tabs based on user role - Customers is now available for everyone
  const showUsersTab = userRole?.role === 'admin';
  const showNotificationsTab = userRole?.role === 'admin';
  const showSettingsTab = userRole?.role === 'admin';
  const showChatTab = userRole?.role === 'admin';
  const showFinancesTab = userRole?.role === 'admin';
  
  if (isLoading) {
    return <SidebarLoadingState />;
  }
  
  const menuItems = createMenuItems(showUsersTab, showNotificationsTab, showSettingsTab, showChatTab, showFinancesTab, unreadCount);
  
  return (
    <Sidebar className="bg-black border-gray-800" collapsible="icon">
      <SidebarHeader className="border-b border-gray-800 p-2 bg-zinc-950">
        <div className="flex items-center justify-between">
          <SidebarGroupLabel className="text-white font-bold text-lg px-2 py-2 group-data-[collapsible=icon]:hidden">
            Envíos Ojitos
          </SidebarGroupLabel>
          <Button variant="ghost" size="icon" onClick={toggleSidebar} className="h-8 w-8 text-white hover:bg-gray-800 hover:text-white">
            {state === "expanded" ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </SidebarHeader>
      <SidebarContent className="bg-black">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenuSection menuItems={menuItems} activeTab={activeTab} onTabChange={onTabChange} />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
