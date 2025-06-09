
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CustomerAvatar } from './CustomerAvatar';

interface Message {
  id: string;
  message_content: string;
  message_type: 'text' | 'image';
  timestamp: string;
  whatsapp_message_id?: string;
  from_phone?: string;
  is_from_customer?: boolean;
}

interface ChatMessageProps {
  message: Message;
  customerName?: string;
  profileImageUrl?: string;
}

export function ChatMessage({ message, customerName = 'Cliente', profileImageUrl }: ChatMessageProps) {
  const isIncoming = message.is_from_customer !== false;
  
  const getMessageTypeColor = (msgType: string) => {
    switch (msgType) {
      case 'text':
        return "bg-blue-100 text-blue-800";
      case 'image':
        return "bg-green-100 text-green-800";
      case 'audio':
        return "bg-purple-100 text-purple-800";
      case 'video':
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className={`flex ${isIncoming ? 'justify-start' : 'justify-end'} mb-4`}>
      <div className={`max-w-xs lg:max-w-md rounded-lg p-3 ${
        isIncoming 
          ? 'bg-white border border-gray-200' 
          : 'bg-blue-500 text-white'
      }`}>
        {isIncoming && (
          <div className="flex items-center gap-2 mb-2">
            <CustomerAvatar 
              customerName={customerName}
              profileImageUrl={profileImageUrl}
              size="sm"
            />
            <span className="text-xs font-medium text-gray-600">{customerName}</span>
          </div>
        )}
        
        <div className="flex items-center justify-between mb-1">
          <Badge 
            className={isIncoming 
              ? getMessageTypeColor(message.message_type || 'text')
              : "bg-blue-600 text-white"
            }
            variant="secondary"
          >
            {isIncoming ? (message.message_type || 'text') : 'enviado'}
          </Badge>
          <span className={`text-xs ${
            isIncoming ? 'text-gray-500' : 'text-blue-100'
          }`}>
            {format(new Date(message.timestamp), 'HH:mm', { locale: es })}
          </span>
        </div>
        
        <div className="space-y-2">
          <p className="text-sm">{message.message_content || '(Sin contenido de texto)'}</p>
        </div>
      </div>
    </div>
  );
}
