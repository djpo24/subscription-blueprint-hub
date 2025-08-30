
import { TabsContent } from '@/components/ui/tabs';
import { MarketingPanel } from '@/components/marketing/MarketingPanel';

export function MarketingTab() {
  return (
    <TabsContent value="marketing" className="space-y-4 sm:space-y-8 px-2 sm:px-0">
      <MarketingPanel />
    </TabsContent>
  );
}
