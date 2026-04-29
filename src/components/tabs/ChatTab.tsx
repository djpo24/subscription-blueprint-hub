import { ConversationsPage } from '@/components/chat/conversations/ConversationsPage';

export function ChatTab() {
  // Edge-to-edge en mobile (anula el padding del <main>)
  return (
    <div className="-mx-2 sm:mx-0">
      <ConversationsPage />
    </div>
  );
}
