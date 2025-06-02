
import { DispatchesTable } from '@/components/DispatchesTable';
import { TabsContent } from '@/components/ui/tabs';

export function DispatchesTab() {
  return (
    <TabsContent value="dispatches" className="space-y-4 sm:space-y-8 px-2 sm:px-0">
      <DispatchesTable />
    </TabsContent>
  );
}
