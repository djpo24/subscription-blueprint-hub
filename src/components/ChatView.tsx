
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChatList } from './chat/ChatList';
import { ChatConversation } from './chat/ChatConversation';
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
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()); // Sort chronologically for display
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

  // Header simplificado sin controles
  const ChatHeader = () => (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Sistema de Chat WhatsApp
        </CardTitle>
      </CardHeader>
    </Card>
  );

  return (
    <AutoResponseProvider>
      <div className="h-[calc(100vh-12rem)]">
        <ChatHeader />
        
        {/* Vista móvil - mostrar solo lista o solo conversación */}
        {isMobile ? (
          // Si hay una conversación seleccionada, mostrar solo la conversación
          selectedPhone && conversationsByPhone[selectedPhone] ? (
            <div className="h-full flex flex-col">
              {/* Header móvil con botón de volver */}
              <div className="flex items-center gap-3 p-4 border-b border-gray-200 bg-white">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBackToList}
                  className="p-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <h2 className="text-lg font-semibold">
                  {conversationsByPhone[selectedPhone].customerName || 'Cliente'}
                </h2>
              </div>
              
              {/* Conversación completa */}
              <div className="flex-1">
                <ChatConversation
                  phone={selectedPhone}
                  customerName={conversationsByPhone[selectedPhone].customerName}
                  customerId={conversationsByPhone[selectedPhone].customerId}
                  messages={convertToChatMessages(conversationsByPhone[selectedPhone].messages)}
                  isRegistered={!!conversationsByPhone[selectedPhone].customerId}
                  onSendMessage={handleSendMessageWrapper}
                  isLoading={isManualSending}
                  profileImageUrl={conversationsByPhone[selectedPhone].profileImageUrl}
                />
              </div>
            </div>
          ) : (
            // Vista de lista de chats en móvil
            formattedChatList.length === 0 ? (
              <Card className="h-full">
                <CardContent className="flex flex-col items-center justify-center h-full text-center p-6">
                  <MessageSquare className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold mb-2">No hay mensajes</h3>
                  <p className="text-gray-500">
                    Los mensajes de WhatsApp aparecerán aquí cuando los clientes escriban
                  </p>
                </CardContent>
              </Card>
            ) : (
              <ChatList
                chats={formattedChatList}
                selectedPhone={selectedPhone}
                onChatSelect={setSelectedPhone}
              />
            )
          )
        ) : (
          // Vista desktop - mantener el layout actual de dos columnas
          <div className="h-full flex">
            {/* Columna izquierda - Lista de chats */}
            <div className="w-1/3 min-w-[300px] max-w-[400px]">
              {formattedChatList.length === 0 ? (
                <Card className="h-full">
                  <CardContent className="flex flex-col items-center justify-center h-full text-center p-6">
                    <MessageSquare className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-semibold mb-2">No hay mensajes</h3>
                    <p className="text-gray-500">
                      Los mensajes de WhatsApp aparecerán aquí cuando los clientes escriban
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <ChatList
                  chats={formattedChatList}
                  selectedPhone={selectedPhone}
                  onChatSelect={setSelectedPhone}
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
                  onSendMessage={handleSendMessageWrapper}
                  isLoading={isManualSending}
                  profileImageUrl={conversationsByPhone[selectedPhone].profileImageUrl}
                />
              ) : (
                <Card className="h-full">
                  <CardContent className="flex flex-col items-center justify-center h-full text-center p-6">
                    <MessageSquare className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-semibold mb-2">
                      {formattedChatList.length > 0 ? 'Selecciona un chat' : 'No hay conversaciones'}
                    </h3>
                    <p className="text-gray-500">
                      {formattedChatList.length > 0 
                        ? 'Haz clic en una conversación de la izquierda para ver los mensajes'
                        : 'Las conversaciones aparecerán cuando los clientes escriban'
                      }
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </AutoResponseProvider>
  );
}
