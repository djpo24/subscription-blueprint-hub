
import {
  Calendar,
  Home,
  Truck,
  DollarSign,
  MessageCircle,
  Bell,
  Users,
  Settings,
  Code,
  Plane,
  Package,
  CreditCard,
  BarChart3,
  MessageSquare,
  UserCheck,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
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
import { useCurrentUserRoleWithPreview } from '@/hooks/useCurrentUserRoleWithPreview';

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
    return (
      <Sidebar className="bg-black border-gray-800">
        <SidebarContent className="bg-black">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
          </div>
        </SidebarContent>
      </Sidebar>
    );
  }

  const menuItems = [
    {
      title: "Dashboard",
      icon: Home,
      value: "dashboard",
      subItems: [
        { title: "Estadísticas", value: "dashboard" },
        { title: "Acciones Rápidas", value: "dashboard" },
      ]
    },
    {
      title: "Viajes",
      icon: Calendar,
      value: "trips",
      subItems: [
        { title: "Calendario", value: "trips" },
        { title: "Próximos Viajes", value: "trips" },
        { title: "Historial", value: "trips" },
      ]
    },
    {
      title: "Despachos",
      icon: Truck,
      value: "dispatches",
      subItems: [
        { title: "Activos", value: "dispatches" },
        { title: "Programados", value: "dispatches" },
        { title: "Completados", value: "dispatches" },
      ]
    },
    ...(showFinancesTab ? [{
      title: "Finanzas",
      icon: DollarSign,
      value: "finances",
      subItems: [
        { title: "Pagos Pendientes", value: "finances" },
        { title: "Órdenes Cobradas", value: "finances" },
        { title: "Reportes", value: "finances" },
      ]
    }] : []),
    ...(showChatTab ? [{
      title: "Chat",
      icon: MessageCircle,
      value: "chat",
      badge: unreadCount > 0 ? (unreadCount > 9 ? '9+' : unreadCount.toString()) : undefined,
      subItems: [
        { title: "Conversaciones", value: "chat" },
        { title: "Mensajes Enviados", value: "chat" },
        { title: "Plantillas", value: "chat" },
      ]
    }] : []),
    ...(showNotificationsTab ? [{
      title: "Notificaciones",
      icon: Bell,
      value: "notifications",
      subItems: [
        { title: "Recientes", value: "notifications" },
        { title: "Configuración", value: "notifications" },
      ]
    }] : []),
    ...(showUsersTab ? [{
      title: "Usuarios",
      icon: Users,
      value: "users",
      subItems: [
        { title: "Gestión de Usuarios", value: "users" },
        { title: "Permisos", value: "users" },
      ]
    }] : []),
    ...(showSettingsTab ? [{
      title: "Configuración",
      icon: Settings,
      value: "settings",
      subItems: [
        { title: "General", value: "settings" },
        { title: "WhatsApp", value: "settings" },
        { title: "Integraciones", value: "settings" },
      ]
    }] : []),
    {
      title: "Preview",
      icon: Code,
      value: "developer",
      subItems: [
        { title: "Modo Desarrollador", value: "developer" },
        { title: "Vista Previa", value: "developer" },
      ]
    },
  ];

  return (
    <Sidebar className="bg-black border-gray-800" collapsible="icon">
      <SidebarContent className="bg-black">
        <SidebarGroup>
          <SidebarGroupLabel className="text-white font-bold text-lg px-4 py-6">
            Envíos Ojitos
          </SidebarGroupLabel>
          <SidebarGroupContent>
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
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
