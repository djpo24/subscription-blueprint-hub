
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserCheck, UserX, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CustomerAvatar } from './CustomerAvatar';
import { useCustomerPackageStatus } from '@/hooks/useCustomerPackageStatus';
import { PackageStatusIndicator } from './components/PackageStatusIndicator';
import { ChatStatusFilters } from './components/ChatStatusFilters';
import { useChatStatusFilters } from '@/hooks/useChatStatusFilters';
import { useChatPackageStatuses } from '@/hooks/useChatPackageStatuses';

interface ChatItem {
  phone: string;
  customerName?: string;
  lastMessage: string;
  lastMessageTime: string;
  timestamp?: string;
  isRegistered: boolean;
  unreadCount: number;
  profileImageUrl?: string | null;
}

interface ChatListProps {
  chats: ChatItem[];
  selectedPhone: string | null;
  onChatSelect: (phone: string) => void;
}

export function ChatList({ chats, selectedPhone, onChatSelect }: ChatListProps) {
  // Obtener los estados de paquetes para todos los chats
  const { data: chatStatuses = {}, isLoading: statusesLoading } = useChatPackageStatuses(chats);

  // Usar el hook de filtros con los estados reales
  const {
    selectedStatus,
    setSelectedStatus,
    filteredChats,
    chatCounts
  } = useChatStatusFilters(chats, chatStatuses);

  if (chats.length === 0) {
    return (
      <Card className="h-full">
        <CardContent className="flex flex-col items-center justify-center h-full text-center p-6">
          <MessageSquare className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold mb-2">No hay conversaciones</h3>
          <p className="text-gray-500">
            Las conversaciones aparecerán aquí cuando los clientes escriban
          </p>
        </CardContent>
      </Card>
    );
  }

  console.log('📋 [ChatList] Rendering chat list with', chats.length, 'conversations, filtered:', filteredChats.length, 'statuses loading:', statusesLoading);

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Conversaciones</CardTitle>
          <ChatStatusFilters 
            selectedStatus={selectedStatus}
            onStatusSelect={setSelectedStatus}
            chatCounts={chatCounts}
          />
        </div>
      </CardHeader>
      <CardContent className="p-0 h-[calc(100%-5rem)]">
        <ScrollArea className="h-full">
          <div className="space-y-1 p-2">
            {filteredChats.map((chat, index) => {
              const displayName = chat.customerName || 'Cliente';
              const messageTime = chat.lastMessageTime || chat.timestamp || '';
              
              console.log('📋 [ChatList] Rendering filtered chat item #', index + 1, {
                phone: chat.phone,
                customerName: chat.customerName,
                displayName,
                isRegistered: chat.isRegistered,
                messageTime,
                packageStatus: chatStatuses[chat.phone]
              });
              
              return (
                <ChatListItem
                  key={chat.phone}
                  chat={chat}
                  displayName={displayName}
                  messageTime={messageTime}
                  selectedPhone={selectedPhone}
                  onChatSelect={onChatSelect}
                  index={index + 1}
                />
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

interface ChatListItemProps {
  chat: ChatItem;
  displayName: string;
  messageTime: string;
  selectedPhone: string | null;
  onChatSelect: (phone: string) => void;
  index: number;
}

function ChatListItem({ chat, displayName, messageTime, selectedPhone, onChatSelect, index }: ChatListItemProps) {
  const { data: packageIndicator, isLoading, error } = useCustomerPackageStatus(chat.phone);

  console.log('🎯 [ChatListItem]', `#${index}`, {
    phone: chat.phone,
    customerName: chat.customerName,
    hasIndicator: !!packageIndicator,
    isLoading,
    error: error?.message,
    indicatorStatus: packageIndicator?.status
  });

  // Determinar si el último mensaje es del cliente (no respondido)
  const isUnreplied = !chat.lastMessage.startsWith('Tú:');
  
  return (
    <div
      onClick={() => onChatSelect(chat.phone)}
      className={`p-3 rounded-lg cursor-pointer transition-colors border ${
        selectedPhone === chat.phone
          ? 'bg-blue-50 border-blue-200'
          : isUnreplied 
          ? 'bg-green-50/50 hover:bg-green-50 border-green-100' 
          : 'hover:bg-gray-50 border-transparent'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <CustomerAvatar 
            customerName={displayName}
            profileImageUrl={chat.profileImageUrl}
            customerPhone={chat.phone}
            size="md"
            showStatusIndicator={false}
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-medium truncate">
                  {displayName}
                </h4>
                {/* Indicador de estado de paquetes al lado del nombre */}
                {packageIndicator && (
                  <PackageStatusIndicator 
                    packageIndicator={packageIndicator}
                    size="sm"
                  />
                )}
                {isLoading && (
                  <div className="w-3 h-3 bg-gray-300 rounded-full animate-pulse" />
                )}
              </div>
              <Badge 
                variant={chat.isRegistered ? "default" : "secondary"} 
                className="text-xs"
              >
                {chat.isRegistered ? (
                  <UserCheck className="h-3 w-3" />
                ) : (
                  <UserX className="h-3 w-3" />
                )}
              </Badge>
            </div>
            {chat.unreadCount > 0 && (
              <Badge variant="destructive" className="text-xs">
                {chat.unreadCount}
              </Badge>
            )}
          </div>
          
          <p className="text-xs text-gray-600 mb-1">{chat.phone}</p>
          
          <div className="flex justify-between items-end">
            <p className="text-sm text-gray-500 truncate flex-1 mr-2">
              {chat.lastMessage}
            </p>
            {messageTime && (
              <span className="text-xs text-gray-400 flex-shrink-0">
                {format(new Date(messageTime), 'HH:mm', { locale: es })}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
