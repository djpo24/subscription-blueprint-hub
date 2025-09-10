
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Clock, Image as ImageIcon, Bot, User, Reply } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CustomerAvatar } from './CustomerAvatar';
import { AIResponseButton } from './AIResponseButton';
import { useAdvancedBotToggle } from '@/hooks/useAdvancedBotToggle';
import type { ChatMessage as ChatMessageType } from '@/types/chatMessage';

interface ChatMessageProps {
  message: ChatMessageType;
  customerName?: string;
  profileImageUrl?: string | null;
  onSendMessage: (message: string, image?: File) => void;
  customerPhone: string;
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
  const { isManualResponseEnabled } = useAdvancedBotToggle();
  const isFromCustomer = message.is_from_customer !== false;
  const messageTime = format(new Date(message.timestamp), 'HH:mm', { locale: es });
  const messageDate = format(new Date(message.timestamp), 'dd/MM/yyyy', { locale: es });

  const handleAIResponseGenerated = (response: any) => {
    if (response.action === 'send' && response.response) {
      onSendMessage(response.response);
    }
  };

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
                <Badge variant="outline" className="text-xs">
                  {messageTime}
                </Badge>
              </div>

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

              {/* Timestamp detallado */}
              <div className="flex items-center gap-1 mt-2 pt-2 border-t border-gray-200">
                <Clock className="h-3 w-3 text-gray-400" />
                <span className="text-xs text-gray-400">
                  {messageDate} a las {messageTime}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Botón de respuesta IA solo para mensajes del cliente y si la generación manual está habilitada */}
          {isFromCustomer && isManualResponseEnabled && (
            <div className="mt-2 flex justify-start">
              <AIResponseButton
                customerPhone={customerPhone}
                customerId={customerId || ''}
                customerMessage={message.message_content || ''}
                onResponseGenerated={handleAIResponseGenerated}
              />
            </div>
          )}

          {/* Mensaje cuando la generación manual está deshabilitada */}
          {isFromCustomer && !isManualResponseEnabled && (
            <div className="mt-2 flex justify-start">
              <Badge variant="secondary" className="text-xs">
                Generación manual desactivada
              </Badge>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
