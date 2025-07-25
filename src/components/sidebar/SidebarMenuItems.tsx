
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
  UserCheck,
  Megaphone,
  AlertTriangle,
  Search
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
  showMarketingTab: boolean,
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

  // Add Escalations tab for admins only
  if (showUsersTab) { // Using showUsersTab as proxy for admin role
    items.push({ value: 'escalations', title: 'Escalaciones', icon: AlertTriangle });
  }

  if (showMarketingTab) {
    items.push({ value: 'marketing', title: 'Marketing', icon: Megaphone });
  }

  if (showNotificationsTab) {
    items.push({ value: 'notifications', title: 'Notificaciones', icon: Bell });
  }

  if (showUsersTab) {
    items.push({ value: 'users', title: 'Usuarios', icon: Users });
    // Add Investigation tab for admins
    items.push({ value: 'admin-investigation', title: 'Investigación', icon: Search });
  }

  if (showSettingsTab) {
    items.push({ value: 'settings', title: 'Configuración', icon: Settings });
    items.push({ value: 'developer', title: 'Preview', icon: Eye });
  }

  return items;
};
