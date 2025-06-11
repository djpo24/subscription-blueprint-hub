
import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageSquare, UserCheck, UserX, MessageCircle } from 'lucide-react';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { CustomerAvatar } from './CustomerAvatar';
import { useConsultaEncomienda } from '@/hooks/useConsultaEncomienda';
import { ChatMessage as ChatMessageType } from '@/types/chatMessage';

interface ChatConversationProps {
  phone: string;
  customerName?: string;
  customerId?: string | null;
  messages: ChatMessageType[];
  isRegistered: boolean;
  onSendMessage: (message: string, image?: File) => void;
  isLoading: boolean;
  profileImageUrl?: string;
}

export function ChatConversation({
  phone,
  customerName,
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

  // Mostrar nombre registrado si está disponible, si no mostrar "Cliente"
  const displayName = customerName || 'Cliente';

  console.log('ChatConversation render:', {
    phone,
    customerName,
    displayName,
    customerId,
    isRegistered,
    profileImageUrl
  });

  const scrollToBottom = () => {
    if (autoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, autoScroll]);

  const handleInitiateChat = async () => {
    try {
      console.log('🔘 [BUTTON] Iniciar Chat button clicked:', {
        displayName,
        phone,
        customerId
      });
      
      if (!displayName) {
        console.error('❌ [BUTTON] No displayName provided');
        return;
      }
      
      if (!phone) {
        console.error('❌ [BUTTON] No phone provided');
        return;
      }
      
      console.log('⏳ [BUTTON] Calling sendConsultaEncomienda...');
      const success = await sendConsultaEncomienda(displayName, phone, customerId || undefined);
      
      if (success) {
        console.log('✅ [BUTTON] Plantilla consulta_encomienda enviada exitosamente');
      } else {
        console.log('❌ [BUTTON] Plantilla consulta_encomienda falló');
      }
    } catch (error: any) {
      console.error('❌ [BUTTON] Error in handleInitiateChat:', error);
      console.error('❌ [BUTTON] Error stack:', error.stack);
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CustomerAvatar 
              customerName={displayName}
              profileImageUrl={profileImageUrl}
              size="md"
            />
            <div>
              <CardTitle className="text-lg">{displayName}</CardTitle>
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
                Los mensajes aparecerán aquí cuando {displayName} escriba
              </p>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  customerName={displayName}
                  profileImageUrl={profileImageUrl}
                />
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        <ChatInput 
          onSendMessage={onSendMessage} 
          isLoading={isLoading}
          placeholder={`Escribir mensaje a ${displayName}...`}
        />
      </CardContent>
    </Card>
  );
}
