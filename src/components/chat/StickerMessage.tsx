import { Badge } from '@/components/ui/badge';
import { Clock, Sticker } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CustomerAvatar } from './CustomerAvatar';
import type { ChatMessage, StickerData } from '@/types/chatMessage';

interface StickerMessageProps {
  message: ChatMessage;
  customerName?: string;
  profileImageUrl?: string | null;
  customerPhone: string;
}

export function StickerMessage({ 
  message, 
  customerName, 
  profileImageUrl,
  customerPhone 
}: StickerMessageProps) {
  const messageTime = format(new Date(message.timestamp), 'HH:mm', { locale: es });
  const isFromCustomer = message.is_from_customer !== false;
  
  // Extract sticker data from raw_data
  const stickerData: StickerData | null = message.raw_data?.sticker;
  
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

        {/* Contenido del sticker */}
        <div className={`max-w-[80%] ${isFromCustomer ? 'order-1' : 'order-2'}`}>
          <div className={`${isFromCustomer ? 'bg-gray-50 border-gray-200' : 'bg-blue-50 border-blue-200'} border rounded-lg p-3`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Sticker className="h-3 w-3 text-purple-600" />
                <span className="text-xs font-medium text-gray-600">
                  {isFromCustomer ? (customerName || 'Cliente') : 'Enviado'} • Sticker
                </span>
                {stickerData?.animated && (
                  <Badge variant="secondary" className="text-xs">
                    Animado
                  </Badge>
                )}
              </div>
              <Badge variant="outline" className="text-xs">
                {messageTime}
              </Badge>
            </div>

            {/* Sticker content */}
            <div className="flex flex-col items-center">
              {message.media_url ? (
                <div className="bg-white rounded-lg p-1 border">
                  <img 
                    src={message.media_url} 
                    alt="Sticker"
                    className="max-w-32 max-h-32 rounded object-contain cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => window.open(message.media_url, '_blank')}
                  />
                </div>
              ) : (
                <div className="bg-white rounded-lg p-4 border border-dashed border-gray-300">
                  <div className="flex flex-col items-center text-gray-500">
                    <Sticker className="h-8 w-8 mb-2" />
                    <span className="text-sm">Sticker compartido</span>
                    {stickerData?.animated && (
                      <span className="text-xs">(Animado)</span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Timestamp */}
            <div className="flex items-center gap-1 mt-2 pt-2 border-t border-gray-200">
              <Clock className="h-3 w-3 text-gray-400" />
              <span className="text-xs text-gray-400">
                {format(new Date(message.timestamp), 'dd/MM/yyyy', { locale: es })} a las {messageTime}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}