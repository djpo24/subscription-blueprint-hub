
import { DispatchesTable } from '@/components/DispatchesTable';
import { TabsContent } from '@/components/ui/tabs';

export function DispatchesTab() {
  return (
    <TabsContent value="dispatches" className="space-y-8">
      <DispatchesTable />
    </TabsContent>
  );
}
