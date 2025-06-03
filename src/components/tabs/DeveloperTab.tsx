
import { TabsContent } from '@/components/ui/tabs';
import { RolePreviewSelector } from '@/components/RolePreviewSelector';

export function DeveloperTab() {
  return (
    <TabsContent value="developer" className="space-y-4 sm:space-y-6">
      <RolePreviewSelector />
    </TabsContent>
  );
}
