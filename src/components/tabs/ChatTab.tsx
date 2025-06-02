
import { ChatView } from '@/components/ChatView';
import { TabsContent } from '@/components/ui/tabs';

export function ChatTab() {
  return (
    <TabsContent value="chat" className="space-y-4 sm:space-y-8 px-2 sm:px-0">
      <ChatView />
    </TabsContent>
  );
}
