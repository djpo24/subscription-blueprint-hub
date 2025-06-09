
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
} from "lucide-react";

export interface MenuItem {
  title: string;
  icon: any;
  value: string;
  badge?: string;
  subItems: { title: string; value: string }[];
}

export const createMenuItems = (
  showUsersTab: boolean,
  showNotificationsTab: boolean,
  showSettingsTab: boolean,
  showChatTab: boolean,
  showFinancesTab: boolean,
  unreadCount: number
): MenuItem[] => {
  return [
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
};
