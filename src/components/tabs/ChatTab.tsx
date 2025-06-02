
import { ChatView } from '@/components/ChatView';
import { TabsContent } from '@/components/ui/tabs';

export function ChatTab() {
  return (
    <TabsContent value="chat" className="space-y-8">
      <ChatView />
    </TabsContent>
  );
}
