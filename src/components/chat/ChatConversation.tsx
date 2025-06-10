
import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageSquare, UserCheck, UserX, MessageCircle } from 'lucide-react';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { CustomerAvatar } from './CustomerAvatar';
import { useConsultaEncomienda } from '@/hooks/useConsultaEncomienda';

interface Message {
  id: string;
  message_content: string;
  message_type: 'text' | 'image';
  timestamp: string;
  whatsapp_message_id?: string;
  from_phone?: string;
  is_from_customer?: boolean;
}

interface ChatConversationProps {
  phone: string;
  customerName?: string;
  customerId?: string | null;
  messages: Message[];
  isRegistered: boolean;
  onSendMessage: (message: string, image?: File) => void;
  isLoading: boolean;
  profileImageUrl?: string;
}

export function ChatConversation({
  phone,
  customerName = 'Cliente',
  customerId,
  messages,
  isRegistered,
  onSendMessage,
  isLoading,
  profileImageUrl
}: ChatConversationProps) {
  const [autoScroll, setAutoScroll] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { sendConsultaEncomienda, isSending } = useConsultaEncomienda();

  const scrollToBottom = () => {
    if (autoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, autoScroll]);

  const handleInitiateChat = async () => {
    const success = await sendConsultaEncomienda(customerName, phone, customerId || undefined);
    if (success) {
      // Opcionalmente refrescar los mensajes después de enviar
      console.log('Plantilla consulta_encomienda enviada exitosamente');
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CustomerAvatar 
              customerName={customerName}
              profileImageUrl={profileImageUrl}
              size="md"
            />
            <div>
              <CardTitle className="text-lg">{customerName}</CardTitle>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>{phone}</span>
                <Badge variant={isRegistered ? "default" : "secondary"} className="text-xs">
                  {isRegistered ? (
                    <>
                      <UserCheck className="h-3 w-3 mr-1" />
                      Registrado
                    </>
                  ) : (
                    <>
                      <UserX className="h-3 w-3 mr-1" />
                      No registrado
                    </>
                  )}
                </Badge>
              </div>
            </div>
          </div>
          
          {/* Botón Iniciar Chat */}
          <Button
            onClick={handleInitiateChat}
            disabled={isSending}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <MessageCircle className="h-4 w-4" />
            {isSending ? 'Enviando...' : 'Iniciar Chat'}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col min-h-0 p-4">
        {/* Área de mensajes */}
        <div 
          className="flex-1 overflow-y-auto mb-4 space-y-4 scroll-smooth"
          onScroll={(e) => {
            const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
            const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
            setAutoScroll(isNearBottom);
          }}
        >
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <MessageSquare className="h-12 w-12 mb-4 opacity-50" />
              <p className="text-center">No hay mensajes aún</p>
              <p className="text-sm text-center mt-2">
                Los mensajes aparecerán aquí cuando {customerName} escriba
              </p>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  customerName={customerName}
                  profileImageUrl={profileImageUrl}
                />
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input de mensaje */}
        <ChatInput 
          onSendMessage={onSendMessage} 
          isLoading={isLoading}
          placeholder={`Escribir mensaje a ${customerName}...`}
        />
      </CardContent>
    </Card>
  );
}
