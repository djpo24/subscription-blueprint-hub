
import { ChatView } from '@/components/ChatView';
import { useEffect } from 'react';

export function ChatTab() {
  useEffect(() => {
    console.log('🎯 [ChatTab] Component mounted and rendering');
  }, []);

  return (
    <div className="space-y-4 sm:space-y-8 px-2 sm:px-0 w-full">
      <div className="w-full">
        <ChatView />
      </div>
    </div>
  );
}
