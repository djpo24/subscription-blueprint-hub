
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { User, Phone } from 'lucide-react';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';

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
}

export function ChatConversation({ 
  phone, 
  customerName, 
  customerId, 
  messages, 
  isRegistered, 
  onSendMessage,
  isLoading 
}: ChatConversationProps) {
  const formatPhoneNumber = (phoneNumber: string) => {
    if (phoneNumber.startsWith('57')) {
      return `+${phoneNumber.slice(0, 2)} ${phoneNumber.slice(2, 5)} ${phoneNumber.slice(5, 8)} ${phoneNumber.slice(8)}`;
    }
    return `+${phoneNumber}`;
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 p-2 rounded-full">
            <User className="h-5 w-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold">
              {customerName || 'Cliente Anónimo'}
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

      {/* Messages */}
      <ScrollArea className="flex-1 p-4 bg-gray-50">
        <div className="space-y-2">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <p>No hay mensajes en esta conversación</p>
            </div>
          ) : (
            messages.map((message) => (
              <ChatMessage
                key={message.id}
                id={message.id}
                content={message.content}
                timestamp={message.timestamp}
                type={message.type}
                messageType={message.messageType}
                imageUrl={message.imageUrl}
              />
            ))
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <ChatInput
        onSendMessage={onSendMessage}
        isLoading={isLoading}
      />
    </div>
  );
}
