
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CustomerAvatar } from './CustomerAvatar';
import { ChatMessage as ChatMessageType } from '@/types/chatMessage';

interface ChatMessageProps {
  message: ChatMessageType;
  customerName?: string;
  profileImageUrl?: string;
}

export function ChatMessage({ message, customerName = 'Cliente', profileImageUrl }: ChatMessageProps) {
  const isIncoming = message.is_from_customer !== false;
  
  const getMessageTypeColor = (msgType: string, isFromCustomer: boolean) => {
    if (!isFromCustomer) {
      if (msgType === 'template') {
        return "bg-purple-100 text-purple-800";
      }
      return "bg-blue-500 text-white";
    }
    
    switch (msgType) {
      case 'text':
        return "bg-blue-100 text-blue-800";
      case 'image':
        return "bg-green-100 text-green-800";
      case 'document':
        return "bg-orange-100 text-orange-800";
      case 'audio':
        return "bg-purple-100 text-purple-800";
      case 'video':
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getMessageTypeLabel = (msgType: string, isFromCustomer: boolean) => {
    if (!isFromCustomer) {
      if (msgType === 'template') {
        return 'plantilla';
      }
      return 'enviado';
    }
    return msgType || 'text';
  };

  const renderMessageContent = () => {
    console.log('Rendering message:', message.id, 'Type:', message.message_type, 'Media URL:', message.media_url);
    
    return (
      <div className="space-y-2">
        {/* Mostrar imagen si es un mensaje de imagen y tiene media_url */}
        {message.message_type === 'image' && message.media_url && (
          <div className="max-w-xs">
            <img 
              src={message.media_url} 
              alt="Imagen enviada"
              className="rounded-lg max-w-full h-auto cursor-pointer hover:opacity-90 transition-opacity"
              onLoad={() => {
                console.log('Image loaded successfully:', message.media_url);
              }}
              onError={(e) => {
                console.error('Error loading image:', message.media_url, e);
                e.currentTarget.style.display = 'none';
              }}
              onClick={() => {
                // Abrir imagen en nueva ventana para ver en tamaño completo
                window.open(message.media_url, '_blank');
              }}
            />
          </div>
        )}
        
        {/* Mostrar enlace para documentos, audio y video */}
        {(message.message_type === 'document' || message.message_type === 'audio' || message.message_type === 'video') && message.media_url && (
          <div className="p-2 bg-gray-100 rounded-lg">
            <a 
              href={message.media_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline text-sm"
            >
              {message.message_type === 'document' && '📄 Abrir documento'}
              {message.message_type === 'audio' && '🎵 Reproducir audio'}
              {message.message_type === 'video' && '🎥 Reproducir video'}
            </a>
          </div>
        )}
        
        {/* Mostrar texto del mensaje si existe */}
        {message.message_content && message.message_content !== '(Sin contenido de texto)' && (
          <p className="text-sm">{message.message_content}</p>
        )}
        
        {/* Si es imagen pero no hay texto, mostrar indicador */}
        {message.message_type === 'image' && (!message.message_content || message.message_content === '(Sin contenido de texto)') && (
          <p className="text-sm text-gray-500 italic">📷 Imagen</p>
        )}
      </div>
    );
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
            className={getMessageTypeColor(message.message_type || 'text', isIncoming)}
            variant="secondary"
          >
            {getMessageTypeLabel(message.message_type || 'text', isIncoming)}
          </Badge>
          <span className={`text-xs ${
            isIncoming ? 'text-gray-500' : 'text-blue-100'
          }`}>
            {format(new Date(message.timestamp), 'HH:mm', { locale: es })}
          </span>
        </div>
        
        {renderMessageContent()}
      </div>
    </div>
  );
}
