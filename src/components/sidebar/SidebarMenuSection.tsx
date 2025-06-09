
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { MenuItem } from "./SidebarMenuItems";

interface SidebarMenuSectionProps {
  menuItems: MenuItem[];
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function SidebarMenuSection({ menuItems, activeTab, onTabChange }: SidebarMenuSectionProps) {
  return (
    <SidebarMenu>
      {menuItems.map((item) => (
        <SidebarMenuItem key={item.value}>
          <SidebarMenuButton
            isActive={activeTab === item.value}
            className="w-full text-gray-300 hover:text-white hover:bg-gray-800 data-[state=open]:bg-gray-800 data-[state=open]:text-white relative"
            onClick={() => onTabChange(item.value)}
          >
            <div className="relative">
              <item.icon className="h-4 w-4" />
              {/* Badge for collapsed sidebar (icon-only view) */}
              {item.badge && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center group-data-[collapsible=icon]:flex hidden"
                >
                  {item.badge}
                </Badge>
              )}
            </div>
            <span>{item.title}</span>
            {/* Badge for expanded sidebar */}
            {item.badge && (
              <Badge 
                variant="destructive" 
                className="ml-auto h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center group-data-[collapsible=icon]:hidden"
              >
                {item.badge}
              </Badge>
            )}
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
