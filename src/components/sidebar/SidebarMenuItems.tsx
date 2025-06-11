
import { 
  Home, 
  Package, 
  Truck, 
  MessageSquare, 
  Bell, 
  Users, 
  Settings, 
  DollarSign,
  Eye,
  UserCheck
} from 'lucide-react';

export interface MenuItem {
  value: string;
  title: string;
  icon: any;
  badge?: number;
}

export const createMenuItems = (
  showUsersTab: boolean, 
  showNotificationsTab: boolean, 
  showSettingsTab: boolean, 
  showChatTab: boolean, 
  showFinancesTab: boolean,
  unreadCount: number
): MenuItem[] => {
  const items: MenuItem[] = [
    { value: 'dashboard', title: 'Dashboard', icon: Home },
    { value: 'trips', title: 'Viajes', icon: Package },
    { value: 'dispatches', title: 'Despachos', icon: Truck },
  ];

  if (showFinancesTab) {
    items.push({ value: 'finances', title: 'Finanzas', icon: DollarSign });
  }

  // Customers tab is now visible for ALL users
  items.push({ value: 'customers', title: 'Clientes', icon: UserCheck });

  if (showChatTab) {
    items.push({ 
      value: 'chat', 
      title: 'Chat', 
      icon: MessageSquare,
      badge: unreadCount > 0 ? unreadCount : undefined
    });
  }

  if (showNotificationsTab) {
    items.push({ value: 'notifications', title: 'Notificaciones', icon: Bell });
  }

  if (showUsersTab) {
    items.push({ value: 'users', title: 'Usuarios', icon: Users });
  }

  if (showSettingsTab) {
    items.push({ value: 'settings', title: 'Configuración', icon: Settings });
    items.push({ value: 'developer', title: 'Preview', icon: Eye });
  }

  return items;
};
