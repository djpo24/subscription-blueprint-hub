
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { IncomingMessage } from '@/types/supabase-temp';

interface ChatConversation {
  customerId?: string;
  customerName: string;
  messages: IncomingMessage[];
  profileImageUrl?: string;
}

interface ChatData {
  chatList: Array<{
    phone: string;
    customerName: string;
    lastMessage: string;
    timestamp: string;
    unreadCount: number;
    customerId?: string;
    profileImageUrl?: string;
  }>;
  conversationsByPhone: Record<string, ChatConversation>;
  isLoading: boolean;
  refetch: () => void;
}

export function useChatData(): ChatData {
  const { data: messages = [], isLoading, refetch } = useQuery({
    queryKey: ['chat-data'],
    queryFn: async (): Promise<IncomingMessage[]> => {
      console.log('🔍 Fetching chat data...');
      
      try {
        const { data, error } = await supabase
          .from('incoming_messages')
          .select(`
            *,
            customers (
              name,
              profile_image_url
            )
          `)
          .order('timestamp', { ascending: false })
          .limit(50);

        if (error) {
          console.error('❌ Error fetching chat data:', error);
          throw error;
        }

        return (data || []).map(msg => ({
          id: msg.id,
          whatsapp_message_id: msg.whatsapp_message_id,
          from_phone: msg.from_phone,
          customer_id: msg.customer_id,
          message_type: msg.message_type,
          message_content: msg.message_content,
          media_url: msg.media_url,
          timestamp: msg.timestamp,
          customers: msg.customers ? {
            name: msg.customers.name,
            profile_image_url: msg.customers.profile_image_url || undefined
          } : undefined
        }));
      } catch (error) {
        console.error('❌ Error in useChatData:', error);
        return [];
      }
    },
    refetchInterval: 5000,
  });

  // Group messages by phone number
  const conversationsByPhone: Record<string, ChatConversation> = {};
  const chatList: Array<{
    phone: string;
    customerName: string;
    lastMessage: string;
    timestamp: string;
    unreadCount: number;
    customerId?: string;
    profileImageUrl?: string;
  }> = [];

  messages.forEach(message => {
    const phone = message.from_phone;
    if (!conversationsByPhone[phone]) {
      conversationsByPhone[phone] = {
        customerId: message.customer_id,
        customerName: message.customers?.name || phone,
        messages: [],
        profileImageUrl: message.customers?.profile_image_url
      };
    }
    conversationsByPhone[phone].messages.push(message);
  });

  // Create chat list
  Object.entries(conversationsByPhone).forEach(([phone, conversation]) => {
    const lastMessage = conversation.messages[0];
    if (lastMessage) {
      chatList.push({
        phone,
        customerName: conversation.customerName,
        lastMessage: lastMessage.message_content || '',
        timestamp: lastMessage.timestamp || '',
        unreadCount: 0,
        customerId: conversation.customerId,
        profileImageUrl: conversation.profileImageUrl
      });
    }
  });

  return {
    chatList,
    conversationsByPhone,
    isLoading,
    refetch
  };
}
