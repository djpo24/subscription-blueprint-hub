
import { useState, useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserCheck, UserX, MessageSquare } from 'lucide-react';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { CustomerAvatar } from './CustomerAvatar';
import { CustomerInfoButton } from './CustomerInfoButton';
import { useCustomerPackageStatus } from '@/hooks/useCustomerPackageStatus';
import { PackageStatusIndicator } from './components/PackageStatusIndicator';
import type { ChatMessage as ChatMessageType } from '@/types/chatMessage';

interface ChatConversationProps {
  phone: string;
  customerName?: string;
  customerId?: string | null;
  messages: ChatMessageType[];
  isRegistered: boolean;
  onSendMessage: (message: string, image?: File) => void;
  isLoading: boolean;
  profileImageUrl?: string | null;
}

export function ChatConversation({
  phone,
  customerName,
  customerId,
  messages: initialMessages,
  isRegistered,
  onSendMessage,
  isLoading,
  profileImageUrl
}: ChatConversationProps) {
  // Estado local para manejar la lista de mensajes (SIN PROCESAMIENTO AUTOMÁTICO)
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Función para hacer scroll al final
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  // ELIMINADO: NO HAY PROCESAMIENTO AUTOMÁTICO DE MENSAJES
  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  // Auto-scroll cuando cambian los mensajes
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const { data: packageIndicator } = useCustomerPackageStatus(phone);
  const displayName = customerName || 'Cliente';

  // Función para manejar la eliminación de mensajes
  const handleMessageDeleted = (messageId: string) => {
    setMessages(prevMessages => 
      prevMessages.filter(message => message.id !== messageId)
    );
  };

  return (
    <Card className="h-full flex flex-col">
      {/* Header con información del cliente */}
      <CardHeader className="flex-shrink-0 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CustomerAvatar 
              customerName={displayName}
              profileImageUrl={profileImageUrl}
              customerPhone={phone}
              size="md"
              showStatusIndicator={false}
            />
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-semibold">{displayName}</h3>
                <Badge variant={isRegistered ? "default" : "secondary"} className="text-xs">
                  {isRegistered ? <UserCheck className="h-3 w-3" /> : <UserX className="h-3 w-3" />}
                </Badge>
                
                {/* Indicador de estado de paquetes en el header */}
                {packageIndicator && (
                  <div className="flex items-center gap-2">
                    <PackageStatusIndicator 
                      packageIndicator={packageIndicator}
                      size="md"
                    />
                    <span className="text-xs text-gray-500">
                      {packageIndicator.label}
                    </span>
                  </div>
                )}
              </div>
              
              <p className="text-sm text-gray-600">{phone}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {customerId && (
              <CustomerInfoButton 
                customerId={customerId}
                customerName={displayName}
                customerPhone={phone}
              />
            )}
          </div>
        </div>
      </CardHeader>

      {/* Área de mensajes */}
      <CardContent className="flex-1 p-0 flex flex-col min-h-0">
        <ScrollArea className="flex-1 px-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <MessageSquare className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold mb-2">No hay mensajes</h3>
              <p className="text-gray-500">
                Esta es una nueva conversación
              </p>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              {messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  customerName={customerName}
                  profileImageUrl={profileImageUrl}
                  onSendMessage={onSendMessage}
                  customerPhone={phone}
                  customerId={customerId}
                  onMessageDeleted={handleMessageDeleted}
                  allMessages={initialMessages}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>

        {/* Input de chat */}
        <div className="flex-shrink-0 p-4 border-t">
          <ChatInput
            onSendMessage={onSendMessage}
            isLoading={isLoading}
            placeholder={`Escribe un mensaje a ${displayName}...`}
          />
        </div>
      </CardContent>
    </Card>
  );
}
