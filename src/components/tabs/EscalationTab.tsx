
import { TabsContent } from '@/components/ui/tabs';
import { EscalationControlPanel } from '@/components/chat/EscalationControlPanel';

export function EscalationTab() {
  return (
    <TabsContent value="escalations" className="mt-0">
      <div className="container mx-auto p-6">
        <EscalationControlPanel />
      </div>
    </TabsContent>
  );
}
