
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NotificationsTab } from '@/components/tabs/NotificationsTab';

interface MainTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function MainTabs({ activeTab, onTabChange }: MainTabsProps) {
  return (
    <div className="p-4 sm:p-6">
      <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-1">
          <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
        </TabsList>

        <NotificationsTab />
      </Tabs>
    </div>
  );
}
