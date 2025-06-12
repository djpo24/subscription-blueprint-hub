
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { CustomerAvatar } from './CustomerAvatar';
import { AIResponseButton } from './AIResponseButton';
import type { ChatMessage } from '@/types/chatMessage';

interface ChatMessageProps {
  message: ChatMessage;
  customerName?: string;
  profileImageUrl?: string;
  onSendMessage?: (message: string) => void;
  customerPhone?: string;
  customerId?: string | null;
}

export function ChatMessage({ 
  message, 
  customerName, 
  profileImageUrl,
  onSendMessage,
  customerPhone,
  customerId
}: ChatMessageProps) {
  const isFromCustomer = message.is_from_customer;
  const timeAgo = formatDistanceToNow(new Date(message.timestamp), {
    addSuffix: true,
    locale: es,
  });

  const shouldShowAIButton = isFromCustomer && onSendMessage && customerPhone && message.message_content;

  return (
    <div className={`flex ${isFromCustomer ? 'justify-start' : 'justify-end'} mb-4`}>
      <div className={`flex items-start gap-2 max-w-[80%] ${isFromCustomer ? 'flex-row' : 'flex-row-reverse'}`}>
        {isFromCustomer && (
          <CustomerAvatar 
            customerName={customerName || 'Cliente'}
            profileImageUrl={profileImageUrl}
            size="sm"
          />
        )}
        
        <div className="space-y-2">
          <div className={`rounded-lg px-3 py-2 ${
            isFromCustomer 
              ? 'bg-gray-100 text-gray-900' 
              : 'bg-blue-500 text-white'
          }`}>
            {message.message_type === 'text' && message.message_content && (
              <p className="text-sm whitespace-pre-wrap">{message.message_content}</p>
            )}
            
            {message.message_type === 'image' && message.media_url && (
              <div className="space-y-2">
                <img 
                  src={message.media_url} 
                  alt="Imagen enviada" 
                  className="max-w-xs rounded"
                />
                {message.message_content && (
                  <p className="text-sm">{message.message_content}</p>
                )}
              </div>
            )}
            
            {message.message_type === 'template' && (
              <p className="text-sm italic">{message.message_content}</p>
            )}
            
            <div className={`text-xs mt-1 ${
              isFromCustomer ? 'text-gray-500' : 'text-blue-100'
            }`}>
              {timeAgo}
            </div>
          </div>
          
          {/* AI Response Button - solo para mensajes de clientes */}
          {shouldShowAIButton && (
            <AIResponseButton
              customerMessage={message.message_content}
              customerPhone={customerPhone}
              customerId={customerId}
              onSendMessage={onSendMessage}
            />
          )}
        </div>
      </div>
    </div>
  );
}
