
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
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

interface ChatViewMobileProps {
  selectedPhone: string | null;
  chatList: ChatItem[];
  conversationsByPhone: Record<string, ConversationData>;
  onChatSelect: (phone: string) => void;
  onSendMessage: (message: string, image?: File) => Promise<void>;
  onBackToList: () => void;
  isManualSending: boolean;
  convertToChatMessages: (messages: any[]) => ChatMessage[];
}

export function ChatViewMobile({
  selectedPhone,
  chatList,
  conversationsByPhone,
  onChatSelect,
  onSendMessage,
  onBackToList,
  isManualSending,
  convertToChatMessages
}: ChatViewMobileProps) {
  // Si hay una conversación seleccionada, mostrar solo la conversación
  if (selectedPhone && conversationsByPhone[selectedPhone]) {
    const conversation = conversationsByPhone[selectedPhone];
    
    return (
      <div className="h-full flex flex-col">
        {/* Header móvil con botón de volver */}
        <div className="flex items-center gap-3 p-4 border-b border-gray-200 bg-white">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBackToList}
            className="p-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-semibold">
            {conversation.customerName || 'Cliente'}
          </h2>
        </div>
        
        {/* Conversación completa */}
        <div className="flex-1">
          <ChatConversation
            phone={selectedPhone}
            customerName={conversation.customerName}
            customerId={conversation.customerId}
            messages={convertToChatMessages(conversation.messages)}
            isRegistered={!!conversation.customerId}
            onSendMessage={onSendMessage}
            isLoading={isManualSending}
            profileImageUrl={conversation.profileImageUrl}
          />
        </div>
      </div>
    );
  }

  // Vista de lista de chats en móvil
  if (chatList.length === 0) {
    return <ChatViewEmptyState type="no-messages" />;
  }

  return (
    <ChatList
      chats={chatList}
      selectedPhone={selectedPhone}
      onChatSelect={onChatSelect}
    />
  );
}
