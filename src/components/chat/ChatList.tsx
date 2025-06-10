
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Phone, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CustomerAvatar } from './CustomerAvatar';
import { useIsMobile } from '@/hooks/use-mobile';

interface ChatListItem {
  phone: string;
  customerName?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount?: number;
  isRegistered: boolean;
  profileImageUrl?: string;
}

interface ChatListProps {
  chats: ChatListItem[];
  selectedPhone: string | null;
  onChatSelect: (phone: string) => void;
}

export function ChatList({
  chats,
  selectedPhone,
  onChatSelect
}: ChatListProps) {
  const isMobile = useIsMobile();

  const formatPhoneNumber = (phone: string) => {
    if (phone.startsWith('57')) {
      return `+${phone.slice(0, 2)} ${phone.slice(2, 5)} ${phone.slice(5, 8)} ${phone.slice(8)}`;
    }
    return `+${phone}`;
  };

  return (
    <div className="h-full flex flex-col border-r border-gray-200 bg-white">
      <div className="p-3 sm:p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold">Chats</h2>
        <p className="text-sm text-gray-500">{chats.length} conversaciones</p>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="divide-y divide-gray-100">
          {chats.map(chat => (
            <div 
              key={chat.phone} 
              onClick={() => onChatSelect(chat.phone)} 
              className={`p-3 sm:p-4 cursor-pointer hover:bg-gray-50 transition-colors active:bg-gray-100 ${
                selectedPhone === chat.phone && !isMobile ? 'bg-blue-50 border-r-2 border-blue-500' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <CustomerAvatar 
                  customerName={chat.customerName}
                  profileImageUrl={chat.profileImageUrl}
                  size={isMobile ? "sm" : "md"}
                />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-medium truncate text-sm sm:text-base">
                      {chat.customerName || 'Cliente Anónimo'}
                    </h3>
                    <span className="text-xs text-gray-500 flex-shrink-0">
                      {format(new Date(chat.lastMessageTime), isMobile ? 'HH:mm' : 'HH:mm', {
                        locale: es
                      })}
                    </span>
                  </div>
                  
                  {!isMobile && (
                    <div className="flex items-center gap-2 mb-2">
                      <Phone className="h-3 w-3 text-gray-400" />
                      <span className="text-xs text-gray-500 truncate">
                        {formatPhoneNumber(chat.phone)}
                      </span>
                      <Badge variant={chat.isRegistered ? "default" : "secondary"} className="text-xs">
                        {chat.isRegistered ? 'Registrado' : 'No registrado'}
                      </Badge>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <p className="text-xs sm:text-sm text-gray-600 truncate flex-1">
                      {chat.lastMessage}
                    </p>
                    
                    <div className="flex items-center gap-2 ml-2">
                      {isMobile && (
                        <Badge variant={chat.isRegistered ? "default" : "secondary"} className="text-xs">
                          {chat.isRegistered ? 'R' : 'NR'}
                        </Badge>
                      )}
                      
                      {chat.unreadCount && chat.unreadCount > 0 && (
                        <Badge className="bg-green-500 text-white text-xs min-w-[20px] h-5 rounded-full flex items-center justify-center">
                          {chat.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
