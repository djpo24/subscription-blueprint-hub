
import { ChatView } from '@/components/ChatView';
import { TabsContent } from '@/components/ui/tabs';
import { ProfileImageMigration } from '@/components/ProfileImageMigration';

export function ChatTab() {
  return (
    <TabsContent value="chat" className="space-y-4 sm:space-y-8 px-2 sm:px-0">
      {/* Migración de fotos de perfil */}
      <div className="flex justify-center">
        <ProfileImageMigration />
      </div>
      
      <ChatView />
    </TabsContent>
  );
}
