
import { useMemo, useState } from 'react';
import { PackageStatus } from '@/components/chat/types/PackageStatusTypes';

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

interface ChatWithStatus extends ChatItem {
  packageStatus?: PackageStatus;
}

export function useChatStatusFilters(chats: ChatItem[], chatStatuses: Record<string, PackageStatus>) {
  const [selectedStatus, setSelectedStatus] = useState<PackageStatus | null>(null);

  // Combinar chats con sus estados de paquetes
  const chatsWithStatus: ChatWithStatus[] = useMemo(() => {
    return chats.map(chat => ({
      ...chat,
      packageStatus: chatStatuses[chat.phone]
    }));
  }, [chats, chatStatuses]);

  // Filtrar chats según el estado seleccionado
  const filteredChats = useMemo(() => {
    if (!selectedStatus) {
      return chatsWithStatus;
    }
    
    return chatsWithStatus.filter(chat => chat.packageStatus === selectedStatus);
  }, [chatsWithStatus, selectedStatus]);

  // Contar chats por estado
  const chatCounts = useMemo(() => {
    const counts: Record<PackageStatus, number> = {
      'pending_pickup_payment': 0,
      'delivered_pending_payment': 0,
      'pending_delivery': 0,
      'dispatched': 0,
      'in_transit': 0,
      'received_processed': 0,
      'delivered': 0
    };

    chatsWithStatus.forEach(chat => {
      if (chat.packageStatus) {
        counts[chat.packageStatus]++;
      }
    });

    return counts;
  }, [chatsWithStatus]);

  return {
    selectedStatus,
    setSelectedStatus,
    filteredChats,
    chatCounts
  };
}
