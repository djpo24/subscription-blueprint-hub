
import { NotificationSettings } from '@/components/NotificationSettings';
import { TabsContent } from '@/components/ui/tabs';

export function SettingsTab() {
  return (
    <TabsContent value="settings" className="space-y-4 sm:space-y-8 px-2 sm:px-0">
      <NotificationSettings />
    </TabsContent>
  );
}
