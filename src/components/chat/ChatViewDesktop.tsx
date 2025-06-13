
import { ChatList } from './ChatList';
import { ChatConversation } from './ChatConversation';
import { ChatViewEmptyState } from './ChatViewEmptyState';
import type { ChatMessage } from '@/types/chatMessage';

interface ChatItem {
  phone: string;
  customerName?: string;
  lastMessage: string;
  lastMessageTime: string;
  isRegistered: boolean;
  unreadCount: number;
  profileImageUrl?: string | null;
}

interface ConversationData {
  customerName?: string;
  customerId?: string | null;
  messages: any[];
  profileImageUrl?: string | null;
}

interface ChatViewDesktopProps {
  selectedPhone: string | null;
  chatList: ChatItem[];
  conversationsByPhone: Record<string, ConversationData>;
  onChatSelect: (phone: string) => void;
  onSendMessage: (message: string, image?: File) => Promise<void>;
  isManualSending: boolean;
  convertToChatMessages: (messages: any[]) => ChatMessage[];
}

export function ChatViewDesktop({
  selectedPhone,
  chatList,
  conversationsByPhone,
  onChatSelect,
  onSendMessage,
  isManualSending,
  convertToChatMessages
}: ChatViewDesktopProps) {
  return (
    <div className="h-full flex">
      {/* Columna izquierda - Lista de chats */}
      <div className="w-1/3 min-w-[300px] max-w-[400px]">
        {chatList.length === 0 ? (
          <ChatViewEmptyState type="no-messages" />
        ) : (
          <ChatList
            chats={chatList}
            selectedPhone={selectedPhone}
            onChatSelect={onChatSelect}
          />
        )}
      </div>

      {/* Columna derecha - Conversación seleccionada */}
      <div className="flex-1">
        {selectedPhone && conversationsByPhone[selectedPhone] ? (
          <ChatConversation
            phone={selectedPhone}
            customerName={conversationsByPhone[selectedPhone].customerName}
            customerId={conversationsByPhone[selectedPhone].customerId}
            messages={convertToChatMessages(conversationsByPhone[selectedPhone].messages)}
            isRegistered={!!conversationsByPhone[selectedPhone].customerId}
            onSendMessage={onSendMessage}
            isLoading={isManualSending}
            profileImageUrl={conversationsByPhone[selectedPhone].profileImageUrl}
          />
        ) : (
          <ChatViewEmptyState 
            type="select-chat" 
            chatCount={chatList.length}
          />
        )}
      </div>
    </div>
  );
}
