
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Clock, Image as ImageIcon, Bot, User, Reply, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CustomerAvatar } from './CustomerAvatar';
import { AIResponseButton } from './AIResponseButton';
import { StickerMessage } from './StickerMessage';
import { ReplyMessage } from './ReplyMessage';
import { ReactionOverlay } from './ReactionOverlay';
import { useAdvancedBotToggle } from '@/hooks/useAdvancedBotToggle';
import { useUserRole } from '@/hooks/useUserRole';
import { useDeleteMessage } from '@/hooks/useDeleteMessage';
import type { ChatMessage as ChatMessageType, ProcessedMessage } from '@/types/chatMessage';

interface ChatMessageProps {
  message: ProcessedMessage;
  customerName?: string;
  profileImageUrl?: string | null;
  onSendMessage: (message: string, image?: File) => void;
  customerPhone: string;
  customerId?: string | null;
  onMessageDeleted?: (messageId: string) => void;
  allMessages?: ChatMessageType[];
}

export function ChatMessage({ 
  message, 
  customerName, 
  profileImageUrl,
  onSendMessage,
  customerPhone,
  customerId,
  onMessageDeleted,
  allMessages = []
}: ChatMessageProps) {
  const { isManualResponseEnabled } = useAdvancedBotToggle();
  const { isAdmin } = useUserRole();
  const { deleteMessage, isDeleting } = useDeleteMessage();
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const isFromCustomer = message.is_from_customer !== false;
  const messageTime = format(new Date(message.timestamp), 'HH:mm', { locale: es });
  const messageDate = format(new Date(message.timestamp), 'dd/MM/yyyy', { locale: es });

  const handleAIResponseGenerated = (response: any) => {
    if (response.action === 'send' && response.response) {
      onSendMessage(response.response);
    }
  };

  const handleDeleteClick = () => {
    setShowConfirmDelete(true);
  };

  const handleConfirmDelete = async () => {
    const messageType = isFromCustomer ? 'incoming' : 'sent';
    const success = await deleteMessage({
      messageId: message.id,
      messageType,
      onDeleted: () => {
        onMessageDeleted?.(message.id);
        setShowConfirmDelete(false);
      }
    });
    
    if (!success) {
      setShowConfirmDelete(false);
    }
  };

  const handleCancelDelete = () => {
    setShowConfirmDelete(false);
  };

  // Handle reply messages
  if (message.isReply && message.referencedMessage) {
    return (
      <ReplyMessage 
        message={message}
        referencedMessage={message.referencedMessage}
        customerName={customerName}
        profileImageUrl={profileImageUrl}
        customerPhone={customerPhone}
        reactions={message.reactions}
      />
    );
  }

  // Skip standalone reaction messages (they'll be shown as overlays on original messages)
  if (message.message_type === 'reaction') {
    return null;
  }

  if (message.message_type === 'sticker') {
    return (
      <StickerMessage 
        message={message}
        customerName={customerName}
        profileImageUrl={profileImageUrl}
        customerPhone={customerPhone}
      />
    );
  }

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

        {/* Contenido del mensaje */}
        <div className={`max-w-[80%] ${isFromCustomer ? 'order-1' : 'order-2'}`}>
          <Card className={`${isFromCustomer ? 'bg-gray-50' : 'bg-blue-50 border-blue-200'}`}>
            <CardContent className="p-3">
              {/* Header del mensaje con indicador de origen */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {isFromCustomer ? (
                    <User className="h-3 w-3 text-gray-600" />
                  ) : (
                    <Bot className="h-3 w-3 text-blue-600" />
                  )}
                  <span className="text-xs font-medium text-gray-600">
                    {isFromCustomer ? (customerName || 'Cliente') : 'Enviado'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {messageTime}
                  </Badge>
                  {/* Botón de eliminar para administradores */}
                  {isAdmin && !showConfirmDelete && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleDeleteClick}
                      className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                      title="Eliminar mensaje"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Confirmación de eliminación */}
              {isAdmin && showConfirmDelete && (
                <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded">
                  <p className="text-xs text-red-800 mb-2">
                    ¿Estás seguro de que quieres eliminar este mensaje?
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleConfirmDelete}
                      disabled={isDeleting}
                      className="h-6 text-xs px-2"
                    >
                      {isDeleting ? 'Eliminando...' : 'Sí, eliminar'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCancelDelete}
                      disabled={isDeleting}
                      className="h-6 text-xs px-2"
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}

              {/* Contenido del mensaje */}
              <div className="space-y-2">
                {message.message_content && (
                  <p className="text-sm whitespace-pre-wrap break-words">
                    {message.message_content}
                  </p>
                )}
                
                {/* Renderizar diferentes tipos de media */}
                {message.media_url && (
                  <div className="mt-2">
                    {message.message_type === 'audio' && (
                      <div className="bg-white rounded-lg p-2 border">
                        <audio 
                          controls 
                          className="w-full max-w-xs"
                          preload="metadata"
                        >
                          <source src={message.media_url} type="audio/ogg" />
                          <source src={message.media_url} type="audio/mpeg" />
                          <source src={message.media_url} type="audio/wav" />
                          Tu navegador no soporta la reproducción de audio.
                        </audio>
                      </div>
                    )}
                    
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
                    
                    {message.message_type === 'video' && (
                      <div className="bg-white rounded-lg p-1 border">
                        <video 
                          controls 
                          className="max-w-xs max-h-64 rounded"
                          preload="metadata"
                        >
                          <source src={message.media_url} type="video/mp4" />
                          <source src={message.media_url} type="video/webm" />
                          Tu navegador no soporta la reproducción de video.
                        </video>
                      </div>
                    )}
                    
                    {message.message_type === 'document' && (
                      <div className="bg-white rounded-lg p-3 border">
                        <div className="flex items-center gap-2">
                          <div className="bg-gray-100 p-2 rounded">
                            📄
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">Documento</p>
                            <button
                              onClick={() => window.open(message.media_url, '_blank')}
                              className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
                            >
                              Descargar archivo
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Reacciones si las hay */}
              <ReactionOverlay reactions={message.reactions || []} />

              {/* Timestamp detallado con checkmarks para mensajes enviados */}
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-gray-400" />
                  <span className="text-xs text-gray-400">
                    {messageDate} a las {messageTime}
                  </span>
                </div>
                {/* Checkmarks para mensajes enviados (similar a WhatsApp) */}
                {!isFromCustomer && (
                  <div className="flex items-center gap-0.5">
                    <svg className="h-3 w-3 text-blue-500" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M12.354 4.354a.5.5 0 0 0-.708-.708L5 10.293 1.854 7.146a.5.5 0 1 0-.708.708l3.5 3.5a.5.5 0 0 0 .708 0l7-7z"/>
                    </svg>
                    <svg className="h-3 w-3 text-blue-500 -ml-1.5" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M12.354 4.354a.5.5 0 0 0-.708-.708L5 10.293 1.854 7.146a.5.5 0 1 0-.708.708l3.5 3.5a.5.5 0 0 0 .708 0l7-7z"/>
                    </svg>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
