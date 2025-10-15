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
      try {
        console.log('🔍 Fetching chat data...');
        
        // Fetch incoming messages (optimized query)
        const { data: incomingData, error: incomingError } = await supabase
          .from('incoming_messages')
          .select(`
            id,
            whatsapp_message_id,
            from_phone,
            customer_id,
            message_type,
            message_content,
            media_url,
            timestamp,
            customers (
              id,
              name,
              profile_image_url,
              phone,
              whatsapp_number
            )
          `)
          .order('timestamp', { ascending: false })
          .limit(300); // Reducido significativamente

        if (incomingError) {
          console.error('❌ Error fetching incoming messages:', incomingError);
          throw incomingError;
        }

        console.log('📨 Incoming messages fetched:', incomingData?.length || 0);

        // Fetch sent messages (optimized query)
        const { data: sentData, error: sentError } = await supabase
          .from('sent_messages')
          .select(`
            id,
            phone,
            customer_id,
            message,
            image_url,
            sent_at,
            whatsapp_message_id,
            customers (
              id,
              name,
              profile_image_url,
              phone,
              whatsapp_number
            )
          `)
          .order('sent_at', { ascending: false })
          .limit(300); // Reducido significativamente

        if (sentError) {
          console.error('❌ Error fetching sent messages:', sentError);
          throw sentError;
        }

        console.log('📤 Sent messages fetched:', sentData?.length || 0);

        // Procesar mensajes entrantes
        const incomingMessages = (incomingData || []).map(msg => ({
          id: msg.id,
          whatsapp_message_id: msg.whatsapp_message_id,
          from_phone: msg.from_phone,
          customer_id: msg.customer_id,
          message_type: msg.message_type,
          message_content: msg.message_content,
          media_url: msg.media_url,
          timestamp: msg.timestamp,
          is_from_customer: true,
          customers: msg.customers
        } as IncomingMessage & { is_from_customer: boolean }));

        // Procesar mensajes enviados
        const sentMessages = (sentData || []).map(msg => ({
          id: `sent_${msg.id}`,
          whatsapp_message_id: msg.whatsapp_message_id,
          from_phone: msg.phone,
          customer_id: msg.customer_id,
          message_type: 'text' as const,
          message_content: msg.message,
          media_url: msg.image_url,
          timestamp: msg.sent_at,
          is_from_customer: false,
          customers: msg.customers
        } as IncomingMessage & { is_from_customer: boolean }));

        // Combinar todos los mensajes
        const allMessages = [...incomingMessages, ...sentMessages]
          .filter(msg => msg.from_phone)
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        console.log('✅ Total messages processed:', allMessages.length);
        return allMessages;
      } catch (error) {
        console.error('❌ Error in useChatData:', error);
        return [];
      }
    },
    staleTime: 5 * 1000, // 5 segundos - datos considerados frescos (más rápido para ver cambios)
    gcTime: 2 * 60 * 1000, // 2 minutos - tiempo en cache
    refetchInterval: 5 * 1000, // Actualizar cada 5 segundos (más rápido)
    retry: 2, // Solo 2 reintentos
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
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
      const customerName = message.customers?.name || phone;
      
      conversationsByPhone[phone] = {
        customerId: message.customer_id,
        customerName,
        messages: [],
        profileImageUrl: message.customers?.profile_image_url
      };
    }
    conversationsByPhone[phone].messages.push(message);
  });

  // Sort messages within each conversation
  Object.values(conversationsByPhone).forEach(conversation => {
    conversation.messages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  });

  // Create chat list
  Object.entries(conversationsByPhone).forEach(([phone, conversation]) => {
    const lastMessage = conversation.messages[conversation.messages.length - 1]; // Último mensaje cronológicamente
    if (lastMessage) {
      const messageWithFlag = lastMessage as IncomingMessage & { is_from_customer?: boolean };
      let displayMessage = lastMessage.message_content || '';
      
      if (messageWithFlag.is_from_customer === false) {
        displayMessage = `Tú: ${displayMessage}`;
      }

      chatList.push({
        phone,
        customerName: conversation.customerName,
        lastMessage: displayMessage,
        timestamp: lastMessage.timestamp || '',
        unreadCount: 0,
        customerId: conversation.customerId,
        profileImageUrl: conversation.profileImageUrl
      });
    }
  });

  // Sort chat list by most recent message
  chatList.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return {
    chatList,
    conversationsByPhone,
    isLoading,
    refetch
  };
}