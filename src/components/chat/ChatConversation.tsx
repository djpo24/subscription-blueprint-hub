
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Phone } from 'lucide-react';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { CustomerAvatar } from './CustomerAvatar';
import { TokenExpirationAlert } from '@/components/TokenExpirationAlert';
import { useIsMobile } from '@/hooks/use-mobile';
import { useState, useEffect, useRef } from 'react';

interface ChatMessage {
  id: string;
  content: string;
  timestamp: string;
  type: 'incoming' | 'outgoing';
  messageType?: string;
  imageUrl?: string;
}

interface ChatConversationProps {
  phone: string;
  customerName?: string;
  customerId: string | null;
  messages: ChatMessage[];
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
  const isMobile = useIsMobile();
  const [showTokenAlert, setShowTokenAlert] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const formatPhoneNumber = (phoneNumber: string) => {
    if (!phoneNumber) return 'Sin teléfono';
    if (phoneNumber.startsWith('57')) {
      return `+${phoneNumber.slice(0, 2)} ${phoneNumber.slice(2, 5)} ${phoneNumber.slice(5, 8)} ${phoneNumber.slice(8)}`;
    }
    return `+${phoneNumber}`;
  };

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    const scrollToBottom = () => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    };

    // Small delay to ensure DOM is updated
    const timeoutId = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timeoutId);
  }, [messages]);

  // Initial scroll to bottom when component mounts
  useEffect(() => {
    if (messagesEndRef.current && messages.length > 0) {
      messagesEndRef.current.scrollIntoView({ behavior: 'auto' });
    }
  }, []);

  const handleSendMessage = async (message: string, image?: File) => {
    try {
      await onSendMessage(message, image);
      setShowTokenAlert(false); // Ocultar alerta si el envío es exitoso
    } catch (error: any) {
      // Mostrar alerta si hay error de token expirado
      if (error.message && error.message.includes('Token de WhatsApp expirado')) {
        setShowTokenAlert(true);
      }
      throw error; // Re-lanzar el error para que lo maneje el componente padre
    }
  };

  const hasMessages = messages.length > 0;
  const hasPhone = !!phone;

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header - Solo mostrar en desktop o cuando no viene del ChatView móvil */}
      {!isMobile && (
        <div className="p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center gap-3">
            <CustomerAvatar 
              customerName={customerName}
              profileImageUrl={profileImageUrl}
              size="md"
            />
            <div className="flex-1">
              <h3 className="font-semibold">
                {customerName || 'Cliente'}
              </h3>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Phone className="h-3 w-3" />
                {formatPhoneNumber(phone)}
                <Badge 
                  variant={isRegistered ? "default" : "secondary"}
                  className="text-xs"
                >
                  {isRegistered ? 'Registrado' : 'No registrado'}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Alerta de token expirado */}
      {showTokenAlert && (
        <div className="p-4 border-b border-gray-200">
          <TokenExpirationAlert />
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 min-h-0">
        <ScrollArea 
          ref={scrollAreaRef}
          className="h-full"
        >
          <div className={`${isMobile ? 'p-3' : 'p-4'} bg-gray-50 min-h-full flex flex-col justify-end`}>
            {!hasMessages ? (
              <div className="text-center text-gray-500 py-8">
                {hasPhone ? (
                  <div>
                    <p className="mb-2">Nueva conversación</p>
                    <p className="text-sm">Escribe el primer mensaje para iniciar la conversación por WhatsApp</p>
                  </div>
                ) : (
                  <p>No se encontró número de teléfono para este cliente</p>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {messages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    id={message.id}
                    content={message.content}
                    timestamp={message.timestamp}
                    type={message.type}
                    messageType={message.messageType}
                    imageUrl={message.imageUrl}
                  />
                ))}
                {/* Elemento invisible para el auto-scroll */}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Input - Solo mostrar si hay teléfono */}
      {hasPhone && (
        <div className="border-t border-gray-200">
          <ChatInput
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
          />
        </div>
      )}
    </div>
  );
}
