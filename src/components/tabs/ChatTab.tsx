
import { ChatView } from '@/components/ChatView';
import { TabsContent } from '@/components/ui/tabs';
import { ProfileImageMigration } from '@/components/ProfileImageMigration';
import { ProfileImageTest } from '@/components/ProfileImageTest';

export function ChatTab() {
  return (
    <TabsContent value="chat" className="space-y-4 sm:space-y-8 px-2 sm:px-0">
      {/* Migración y test de fotos de perfil */}
      <div className="flex flex-col items-center space-y-4">
        <ProfileImageTest />
        <ProfileImageMigration />
      </div>
      
      <ChatView />
    </TabsContent>
  );
}
