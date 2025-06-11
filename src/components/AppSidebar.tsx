
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, useSidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useCurrentUserRoleWithPreview } from '@/hooks/useCurrentUserRoleWithPreview';
import { useIsMobile } from '@/hooks/use-mobile';
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
    toggleSidebar,
    setOpenMobile
  } = useSidebar();
  const isMobile = useIsMobile();

  // Show tabs based on user role - Updated permissions for traveler
  const showUsersTab = userRole?.role === 'admin';
  const showNotificationsTab = userRole?.role === 'admin' || userRole?.role === 'traveler';
  const showSettingsTab = userRole?.role === 'admin';
  const showChatTab = userRole?.role === 'admin';
  const showFinancesTab = userRole?.role === 'admin';
  
  if (isLoading) {
    return <SidebarLoadingState />;
  }
  
  const menuItems = createMenuItems(showUsersTab, showNotificationsTab, showSettingsTab, showChatTab, showFinancesTab, unreadCount);
  
  const handleTabChange = (tab: string) => {
    onTabChange(tab);
    // Close sidebar on mobile when selecting an option
    if (isMobile) {
      setOpenMobile(false);
    }
  };
  
  return (
    <Sidebar className="bg-black border-gray-800" collapsible="icon" variant={isMobile ? "floating" : "sidebar"}>
      <SidebarHeader className="border-b border-gray-800 p-2 bg-zinc-950">
        <div className="flex items-center justify-between">
          <SidebarGroupLabel className="text-white font-bold text-sm sm:text-lg px-2 py-2 group-data-[collapsible=icon]:hidden truncate">
            {isMobile ? "Ojitos" : "Envíos Ojitos"}
          </SidebarGroupLabel>
          {!isMobile && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleSidebar} 
              className="h-6 w-6 sm:h-8 sm:w-8 text-white hover:bg-gray-800 hover:text-white flex-shrink-0"
            >
              {state === "expanded" ? <X className="h-3 w-3 sm:h-4 sm:w-4" /> : <Menu className="h-3 w-3 sm:h-4 sm:w-4" />}
            </Button>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent className="bg-black">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenuSection menuItems={menuItems} activeTab={activeTab} onTabChange={handleTabChange} />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
