
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ChatMessageProps {
  id: string;
  content: string;
  timestamp: string;
  type: 'incoming' | 'outgoing';
  messageType?: string;
  imageUrl?: string;
}

export function ChatMessage({ content, timestamp, type, messageType, imageUrl }: ChatMessageProps) {
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
    <div className={`flex ${type === 'outgoing' ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-xs lg:max-w-md rounded-lg p-3 ${
        type === 'incoming' 
          ? 'bg-white border border-gray-200' 
          : 'bg-blue-500 text-white'
      }`}>
        <div className="flex items-center justify-between mb-1">
          <Badge 
            className={type === 'incoming' 
              ? getMessageTypeColor(messageType || 'text')
              : "bg-blue-600 text-white"
            }
            variant="secondary"
          >
            {type === 'incoming' ? (messageType || 'text') : 'enviado'}
          </Badge>
          <span className={`text-xs ${
            type === 'incoming' ? 'text-gray-500' : 'text-blue-100'
          }`}>
            {format(new Date(timestamp), 'HH:mm', { locale: es })}
          </span>
        </div>
        
        <div className="space-y-2">
          <p className="text-sm">{content}</p>
          {imageUrl && (
            <img 
              src={imageUrl} 
              alt="Imagen enviada" 
              className="max-w-48 rounded border cursor-pointer"
              onClick={() => window.open(imageUrl, '_blank')}
            />
          )}
        </div>
      </div>
    </div>
  );
}
