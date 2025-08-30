
import { cn } from '@/lib/utils';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  return (
    <div className="w-64 bg-white border-r border-gray-200 p-4">
      <h2 className="text-lg font-semibold mb-4">Navegación</h2>
      <nav className="space-y-2">
        <button
          onClick={() => onTabChange('dashboard')}
          className={cn(
            "w-full text-left px-3 py-2 rounded-md",
            activeTab === 'dashboard' ? "bg-blue-100 text-blue-700" : "hover:bg-gray-100"
          )}
        >
          Dashboard
        </button>
        <button
          onClick={() => onTabChange('notifications')}
          className={cn(
            "w-full text-left px-3 py-2 rounded-md",
            activeTab === 'notifications' ? "bg-blue-100 text-blue-700" : "hover:bg-gray-100"
          )}
        >
          Notificaciones
        </button>
      </nav>
    </div>
  );
}
