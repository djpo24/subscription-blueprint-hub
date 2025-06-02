
import { Card, CardContent } from '@/components/ui/card';
import { MessageSquare } from 'lucide-react';
import { useState } from 'react';
import { ChatList } from './chat/ChatList';
import { ChatConversation } from './chat/ChatConversation';
import { useChatData } from '@/hooks/useChatData';
import { useChatMessages } from '@/hooks/useChatMessages';

export function ChatView() {
  const [selectedPhone, setSelectedPhone] = useState<string | null>(null);
  const { chatList, conversationsByPhone, isLoading } = useChatData();
  const { handleSendMessage, isManualSending } = useChatMessages();

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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-gray-500">Cargando mensajes del chat...</div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-12rem)]">
      <div className="h-full flex">
        {/* Columna izquierda - Lista de chats */}
        <div className="w-1/3 min-w-[300px] max-w-[400px]">
          {chatList.length === 0 ? (
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
              chats={chatList}
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
              messages={conversationsByPhone[selectedPhone].messages}
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
                  {chatList.length > 0 ? 'Selecciona un chat' : 'No hay conversaciones'}
                </h3>
                <p className="text-gray-500">
                  {chatList.length > 0 
                    ? 'Haz clic en una conversación de la izquierda para ver los mensajes'
                    : 'Las conversaciones aparecerán cuando los clientes escriban'
                  }
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
