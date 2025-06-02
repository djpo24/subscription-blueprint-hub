
import { NotificationSettings } from '@/components/NotificationSettings';
import { TabsContent } from '@/components/ui/tabs';

export function SettingsTab() {
  return (
    <TabsContent value="settings" className="space-y-8">
      <NotificationSettings />
    </TabsContent>
  );
}
