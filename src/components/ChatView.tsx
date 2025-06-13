
import { useState, useEffect } from 'react';
import { ChatViewHeader } from './chat/ChatViewHeader';
import { ChatViewMobile } from './chat/ChatViewMobile';
import { ChatViewDesktop } from './chat/ChatViewDesktop';
import { ChatViewEmptyState } from './chat/ChatViewEmptyState';
import { AutoResponseProvider } from './chat/AutoResponseProvider';
import { useChatData } from '@/hooks/useChatData';
import { useChatMessages } from '@/hooks/useChatMessages';
import { useIsMobile } from '@/hooks/use-mobile';
import type { ChatMessage } from '@/types/chatMessage';

export function ChatView() {
  const [selectedPhone, setSelectedPhone] = useState<string | null>(null);
  const { chatList, conversationsByPhone, isLoading } = useChatData();
  const { handleSendMessage, isManualSending } = useChatMessages();
  const isMobile = useIsMobile();

  // Marcar como visitado cuando se accede a la vista de chat
  useEffect(() => {
    const now = new Date().toISOString();
    localStorage.setItem('chat-last-visited', now);
    console.log('Chat visited at:', now);
  }, []);

  const handleSendMessageWrapper = async (message: string, image?: File) => {
    if (!selectedPhone) return;
    
    const selectedConversation = conversationsByPhone[selectedPhone];
    if (!selectedConversation) return;

    await handleSendMessage(
      selectedPhone,
      selectedConversation.customerId,
      message,
      image
    );
  };

  const handleBackToList = () => {
    setSelectedPhone(null);
  };

  // Convert IncomingMessage to ChatMessage
  const convertToChatMessages = (messages: any[]): ChatMessage[] => {
    return messages
      .map(msg => ({
        id: msg.id,
        message_content: msg.message_content || '',
        message_type: msg.message_type || 'text',
        timestamp: msg.timestamp || new Date().toISOString(),
        whatsapp_message_id: msg.whatsapp_message_id,
        from_phone: msg.from_phone,
        is_from_customer: msg.is_from_customer !== false,
        media_url: msg.media_url
      }))
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  };

  // Convert chatList to proper ChatItem format
  const formatChatList = (chats: any[]) => {
    return chats.map(chat => ({
      phone: chat.phone,
      customerName: chat.customerName,
      lastMessage: chat.lastMessage,
      lastMessageTime: chat.timestamp,
      isRegistered: !!chat.customerId,
      unreadCount: chat.unreadCount || 0,
      profileImageUrl: chat.profileImageUrl
    }));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-gray-500">Cargando mensajes del chat...</div>
      </div>
    );
  }

  const formattedChatList = formatChatList(chatList);

  return (
    <AutoResponseProvider>
      <div className="h-[calc(100vh-12rem)]">
        <ChatViewHeader />
        
        {/* Vista móvil o desktop */}
        {isMobile ? (
          <ChatViewMobile
            selectedPhone={selectedPhone}
            chatList={formattedChatList}
            conversationsByPhone={conversationsByPhone}
            onChatSelect={setSelectedPhone}
            onSendMessage={handleSendMessageWrapper}
            onBackToList={handleBackToList}
            isManualSending={isManualSending}
            convertToChatMessages={convertToChatMessages}
          />
        ) : (
          <ChatViewDesktop
            selectedPhone={selectedPhone}
            chatList={formattedChatList}
            conversationsByPhone={conversationsByPhone}
            onChatSelect={setSelectedPhone}
            onSendMessage={handleSendMessageWrapper}
            isManualSending={isManualSending}
            convertToChatMessages={convertToChatMessages}
          />
        )}
      </div>
    </AutoResponseProvider>
  );
}
