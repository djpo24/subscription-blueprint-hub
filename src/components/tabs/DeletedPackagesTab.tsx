import { TabsContent } from '@/components/ui/tabs';
import { DeletedPackagesPanel } from '@/components/admin/DeletedPackagesPanel';

export function DeletedPackagesTab() {
  return (
    <TabsContent value="deleted-packages" className="space-y-4">
      <DeletedPackagesPanel />
    </TabsContent>
  );
}
