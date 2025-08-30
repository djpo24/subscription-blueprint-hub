
import { TabsContent } from '@/components/ui/tabs';

export function PackagesTab() {
  return (
    <TabsContent value="packages" className="space-y-4 sm:space-y-8 px-2 sm:px-0">
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Encomiendas</h2>
        <p>Panel de gestión de encomiendas</p>
      </div>
    </TabsContent>
  );
}
