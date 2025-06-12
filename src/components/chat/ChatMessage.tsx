
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
import type { ChatMessage as ChatMessageType } from '@/types/chatMessage';

interface ChatMessageProps {
  message: ChatMessageType;
  customerName?: string;
  profileImageUrl?: string | null;
  onSendMessage: (message: string, image?: File) => void;
  customerPhone: string;
  customerId?: string | null;
  isBotEnabled?: boolean;
}

export function ChatMessage({ 
  message, 
  customerName, 
  profileImageUrl,
  onSendMessage,
  customerPhone,
  customerId,
  isBotEnabled = true
}: ChatMessageProps) {
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
                
                {message.media_url && (
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <ImageIcon className="h-3 w-3" />
                    <span>Imagen adjunta</span>
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

          {/* Botón de respuesta IA solo para mensajes del cliente y si el bot está habilitado */}
          {isFromCustomer && isBotEnabled && (
            <div className="mt-2 flex justify-start">
              <AIResponseButton
                customerPhone={customerPhone}
                customerId={customerId || ''}
                customerMessage={message.message_content || ''}
                onResponseGenerated={handleAIResponseGenerated}
              />
            </div>
          )}

          {/* Mensaje cuando el bot está deshabilitado */}
          {isFromCustomer && !isBotEnabled && (
            <div className="mt-2 flex justify-start">
              <Badge variant="secondary" className="text-xs">
                Bot desactivado - Respuesta manual requerida
              </Badge>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
