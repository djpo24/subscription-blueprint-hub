
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
        <Collapsible key={item.value} defaultOpen={activeTab === item.value}>
          <SidebarMenuItem>
            <CollapsibleTrigger asChild>
              <SidebarMenuButton
                isActive={activeTab === item.value}
                className="w-full text-gray-300 hover:text-white hover:bg-gray-800 data-[state=open]:bg-gray-800 data-[state=open]:text-white"
              >
                <item.icon className="h-4 w-4" />
                <span>{item.title}</span>
                {item.badge && (
                  <Badge variant="destructive" className="ml-auto h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center">
                    {item.badge}
                  </Badge>
                )}
              </SidebarMenuButton>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarMenuSub>
                {item.subItems.map((subItem) => (
                  <SidebarMenuSubItem key={subItem.title}>
                    <SidebarMenuSubButton
                      asChild
                      isActive={activeTab === subItem.value}
                      className="text-gray-400 hover:text-white hover:bg-gray-700"
                    >
                      <button
                        onClick={() => onTabChange(subItem.value)}
                        className="w-full text-left"
                      >
                        <span>{subItem.title}</span>
                      </button>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                ))}
              </SidebarMenuSub>
            </CollapsibleContent>
          </SidebarMenuItem>
        </Collapsible>
      ))}
    </SidebarMenu>
  );
}
