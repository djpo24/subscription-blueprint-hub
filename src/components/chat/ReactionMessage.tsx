import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { ChatMessage, ReactionData } from '@/types/chatMessage';

interface ReactionMessageProps {
  message: ChatMessage;
  customerName?: string;
  referencedMessage?: ChatMessage | null;
}

export function ReactionMessage({ message, customerName, referencedMessage }: ReactionMessageProps) {
  const messageTime = format(new Date(message.timestamp), 'HH:mm', { locale: es });
  
  // Extract reaction data from raw_data
  const reactionData: ReactionData | null = message.raw_data?.reaction_details || message.raw_data?.reaction;
  
  if (!reactionData) {
    return null;
  }

  return (
    <div className="flex justify-start items-start gap-3 my-2">
      <div className="max-w-[80%]">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">{reactionData.emoji}</span>
            <span className="text-sm text-gray-600">
              {customerName || 'Cliente'} reaccionó
            </span>
            <Badge variant="outline" className="text-xs">
              {messageTime}
            </Badge>
          </div>
          
          {/* Show referenced message if available */}
          {referencedMessage && (
            <div className="bg-gray-100 border-l-4 border-gray-300 pl-3 py-2 rounded text-sm">
              <div className="flex items-center gap-1 mb-1">
                <span className="text-xs text-gray-500 font-medium">En respuesta a:</span>
              </div>
              <p className="text-gray-700 line-clamp-2">
                {referencedMessage.message_content}
              </p>
            </div>
          )}
          
          {!referencedMessage && (
            <div className="text-xs text-gray-500">
              Reacción a un mensaje anterior
            </div>
          )}
        </div>
      </div>
    </div>
  );
}