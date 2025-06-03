
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSentMessages } from './useSentMessages';

interface IncomingMessage {
  id: string;
  whatsapp_message_id: string;
  from_phone: string;
  customer_id: string | null;
  message_type: string;
  message_content: string | null;
  message_timestamp: string;
  customers?: {
    name: string;
    profile_image_url?: string;
  } | null;
}

interface ChatMessage {
  id: string;
  content: string;
  timestamp: string;
  type: 'incoming' | 'outgoing';
  messageType?: string;
  imageUrl?: string;
}

export function useChatData() {
  const { sentMessages } = useSentMessages();

  const { data: incomingMessages = [], isLoading, refetch } = useQuery({
    queryKey: ['chat-messages'],
    queryFn: async (): Promise<IncomingMessage[]> => {
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
        .limit(100);
      
      if (error) {
        console.error('Error fetching chat messages:', error);
        throw error;
      }
      
      const processedData = (data || []).map(msg => ({
        id: msg.id,
        whatsapp_message_id: msg.whatsapp_message_id,
        from_phone: msg.from_phone,
        customer_id: msg.customer_id,
        message_type: msg.message_type,
        message_content: msg.message_content,
        message_timestamp: msg.timestamp,
        customers: msg.customers
      }));

      console.log('Processed chat messages:', processedData.length);
      
      return processedData;
    },
    refetchInterval: 5000,
  });

  // Combinar mensajes entrantes y enviados por teléfono
  const messagesByPhone = incomingMessages.reduce((acc, message) => {
    const phone = message.from_phone;
    if (!acc[phone]) {
      acc[phone] = [];
    }
    acc[phone].push(message);
    return acc;
  }, {} as Record<string, IncomingMessage[]>);

  // Crear conversaciones completas con mensajes enviados y recibidos
  const conversationsByPhone = Object.keys(messagesByPhone).reduce((acc, phone) => {
    const incoming = messagesByPhone[phone];
    const outgoing = sentMessages.filter(msg => {
      // Comparación más flexible de números de teléfono
      const msgPhone = msg.phone.replace(/[\s\-\(\)\+]/g, '');
      const incomingPhone = phone.replace(/[\s\-\(\)\+]/g, '');
      return msgPhone === incomingPhone || 
             msgPhone.endsWith(incomingPhone) || 
             incomingPhone.endsWith(msgPhone);
    });
    
    const allMessages: ChatMessage[] = [
      ...incoming.map(msg => ({
        id: msg.id,
        content: msg.message_content || '(Sin contenido de texto)',
        timestamp: msg.message_timestamp,
        type: 'incoming' as const,
        messageType: msg.message_type
      })),
      ...outgoing.map(msg => ({
        id: msg.id,
        content: msg.message,
        timestamp: msg.sent_at,
        type: 'outgoing' as const,
        imageUrl: msg.image_url
      }))
    ].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    const latestMessage = incoming[0];
    // Normalizar el profile_image_url para evitar valores undefined problemáticos
    const profileImageUrl = latestMessage?.customers?.profile_image_url || null;

    acc[phone] = {
      messages: allMessages,
      latestIncoming: latestMessage,
      customerName: latestMessage?.customers?.name,
      customerId: latestMessage?.customer_id,
      profileImageUrl: typeof profileImageUrl === 'string' ? profileImageUrl : null
    };

    return acc;
  }, {} as Record<string, {
    messages: ChatMessage[];
    latestIncoming: IncomingMessage;
    customerName?: string;
    customerId: string | null;
    profileImageUrl?: string | null;
  }>);

  // Crear lista de chats para la columna izquierda
  const chatList = Object.entries(conversationsByPhone).map(([phone, conversation]) => ({
    phone,
    customerName: conversation.customerName,
    lastMessage: conversation.messages[conversation.messages.length - 1]?.content || 'Sin mensajes',
    lastMessageTime: conversation.latestIncoming.message_timestamp,
    isRegistered: !!conversation.customerId,
    unreadCount: 0,
    profileImageUrl: conversation.profileImageUrl
  })).sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime());

  console.log('Chat list processed:', chatList.length, 'conversations');

  return {
    chatList,
    conversationsByPhone,
    isLoading,
    refetch
  };
}
