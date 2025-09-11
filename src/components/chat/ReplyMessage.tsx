import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Bot, User, Reply } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CustomerAvatar } from './CustomerAvatar';
import { ReactionOverlay } from './ReactionOverlay';
import type { ChatMessage as ChatMessageType } from '@/types/chatMessage';

interface ReplyMessageProps {
  message: ChatMessageType;
  referencedMessage: ChatMessageType;
  customerName?: string;
  profileImageUrl?: string | null;
  customerPhone: string;
  reactions?: Array<{emoji: string; count: number; users: string[]}>;
}

export function ReplyMessage({ 
  message, 
  referencedMessage,
  customerName, 
  profileImageUrl,
  customerPhone,
  reactions = []
}: ReplyMessageProps) {
  const isFromCustomer = message.is_from_customer !== false;
  const messageTime = format(new Date(message.timestamp), 'HH:mm', { locale: es });
  const messageDate = format(new Date(message.timestamp), 'dd/MM/yyyy', { locale: es });

  return (
    <div className="space-y-3">
      <div className={`flex ${isFromCustomer ? 'justify-start' : 'justify-end'} items-start gap-3`}>
        {/* Avatar del cliente (solo para mensajes entrantes) */}
        {isFromCustomer && (
          <CustomerAvatar 
            customerName={customerName || 'Cliente'}
            profileImageUrl={profileImageUrl}
            customerPhone={customerPhone}
            size="sm"
            showStatusIndicator={false}
          />
        )}

        {/* Contenido del mensaje con reply */}
        <div className={`max-w-[80%] ${isFromCustomer ? 'order-1' : 'order-2'}`}>
          <Card className={`${isFromCustomer ? 'bg-gray-50' : 'bg-blue-50 border-blue-200'}`}>
            <CardContent className="p-3">
              {/* Header del mensaje */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {isFromCustomer ? (
                    <User className="h-3 w-3 text-gray-600" />
                  ) : (
                    <Bot className="h-3 w-3 text-blue-600" />
                  )}
                  <Reply className="h-3 w-3 text-gray-500" />
                  <span className="text-xs font-medium text-gray-600">
                    {isFromCustomer ? (customerName || 'Cliente') : 'Enviado'} respondió
                  </span>
                </div>
                <Badge variant="outline" className="text-xs">
                  {messageTime}
                </Badge>
              </div>

              {/* Mensaje referenciado (al que se está respondiendo) */}
              <div className="bg-green-100 border-l-4 border-green-400 pl-3 py-2 mb-3 rounded-r">
                <div className="flex items-center gap-1 mb-1">
                  <span className="text-xs text-green-700 font-medium">
                    {referencedMessage.is_from_customer !== false ? (customerName || 'Cliente') : 'Envíos Ojito'}
                  </span>
                </div>
                <p className="text-sm text-green-800 line-clamp-3">
                  {referencedMessage.message_content || 'Mensaje multimedia'}
                </p>
                {referencedMessage.media_url && (
                  <div className="text-xs text-green-600 mt-1">
                    📎 {referencedMessage.message_type === 'image' ? 'Imagen' : 
                         referencedMessage.message_type === 'audio' ? 'Audio' :
                         referencedMessage.message_type === 'video' ? 'Video' :
                         referencedMessage.message_type === 'document' ? 'Documento' :
                         referencedMessage.message_type === 'sticker' ? 'Sticker' : 'Archivo'}
                  </div>
                )}
              </div>

              {/* Contenido del mensaje actual */}
              <div className="space-y-2">
                {message.message_content && (
                  <p className="text-sm whitespace-pre-wrap break-words">
                    {message.message_content}
                  </p>
                )}
                
                {/* Media del mensaje actual */}
                {message.media_url && (
                  <div className="mt-2">
                    {message.message_type === 'image' && (
                      <div className="bg-white rounded-lg p-1 border">
                        <img 
                          src={message.media_url} 
                          alt="Imagen compartida"
                          className="max-w-xs max-h-64 rounded object-cover cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => window.open(message.media_url, '_blank')}
                        />
                      </div>
                    )}
                    
                    {message.message_type === 'audio' && (
                      <div className="bg-white rounded-lg p-2 border">
                        <audio 
                          controls 
                          className="w-full max-w-xs"
                          preload="metadata"
                        >
                          <source src={message.media_url} type="audio/ogg" />
                          <source src={message.media_url} type="audio/mpeg" />
                          Tu navegador no soporta la reproducción de audio.
                        </audio>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Reacciones si las hay */}
              <ReactionOverlay reactions={reactions} />

              {/* Timestamp detallado */}
              <div className="flex items-center gap-1 mt-2 pt-2 border-t border-gray-200">
                <Clock className="h-3 w-3 text-gray-400" />
                <span className="text-xs text-gray-400">
                  {messageDate} a las {messageTime}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}