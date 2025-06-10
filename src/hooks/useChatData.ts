
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSentMessages } from './useSentMessages';
import { ChatMessage, IncomingMessage } from '@/types/chatMessage';

export function useChatData() {
  const { sentMessages } = useSentMessages();

  const { data: incomingMessages = [], isLoading, refetch } = useQuery({
    queryKey: ['chat-messages'],
    queryFn: async (): Promise<IncomingMessage[]> => {
      console.log('Fetching incoming messages...');
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
        media_url: msg.media_url || null,
        message_timestamp: msg.timestamp,
        customers: msg.customers
      }));

      console.log('Processed incoming messages:', processedData.length);
      
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
        message_content: msg.message_content || '(Sin contenido de texto)',
        message_type: (msg.message_type || 'text') as 'text' | 'image' | 'document' | 'audio' | 'video',
        timestamp: msg.message_timestamp,
        whatsapp_message_id: msg.whatsapp_message_id,
        from_phone: msg.from_phone,
        is_from_customer: true,
        media_url: msg.media_url || undefined
      })),
      ...outgoing.map(msg => ({
        id: msg.id,
        message_content: msg.message,
        message_type: (msg.image_url ? 'image' : 'text') as 'text' | 'image' | 'document' | 'audio' | 'video',
        timestamp: msg.sent_at,
        is_from_customer: false,
        media_url: msg.image_url || undefined
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

  // Incluir conversaciones de mensajes solo salientes (números a los que hemos enviado pero no hemos recibido respuesta)
  sentMessages.forEach(sentMsg => {
    const phone = sentMsg.phone;
    const normalizedPhone = phone.replace(/[\s\-\(\)\+]/g, '');
    
    // Verificar si ya existe una conversación para este teléfono
    const existingConversation = Object.keys(conversationsByPhone).find(existingPhone => {
      const normalizedExisting = existingPhone.replace(/[\s\-\(\)\+]/g, '');
      return normalizedExisting === normalizedPhone || 
             normalizedExisting.endsWith(normalizedPhone) || 
             normalizedPhone.endsWith(normalizedExisting);
    });
    
    if (!existingConversation) {
      // Crear nueva conversación solo con mensajes salientes
      conversationsByPhone[phone] = {
        messages: [{
          id: sentMsg.id,
          message_content: sentMsg.message,
          message_type: (sentMsg.image_url ? 'image' : 'text') as 'text' | 'image' | 'document' | 'audio' | 'video',
          timestamp: sentMsg.sent_at,
          is_from_customer: false,
          media_url: sentMsg.image_url || undefined
        }],
        latestIncoming: null as any, // No hay mensaje entrante
        customerName: undefined,
        customerId: sentMsg.customer_id,
        profileImageUrl: null
      };
    }
  });

  // Crear lista de chats para la columna izquierda
  const chatList = Object.entries(conversationsByPhone).map(([phone, conversation]) => ({
    phone,
    customerName: conversation.customerName,
    lastMessage: conversation.messages[conversation.messages.length - 1]?.message_content || 'Sin mensajes',
    lastMessageTime: conversation.messages[conversation.messages.length - 1]?.timestamp || new Date().toISOString(),
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
