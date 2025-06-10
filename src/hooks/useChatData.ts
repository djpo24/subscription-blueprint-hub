
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
          id,
          whatsapp_message_id,
          from_phone,
          customer_id,
          message_type,
          message_content,
          media_url,
          timestamp,
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
        media_url: msg.media_url,
        message_timestamp: msg.timestamp,
        customers: msg.customers
      }));

      console.log('Processed incoming messages:', processedData.length);
      console.log('Messages with customer data:', processedData.filter(m => m.customers?.name));
      
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
    const registeredCustomerName = latestMessage?.customers?.name;
    const profileImageUrl = latestMessage?.customers?.profile_image_url;

    console.log('Processing conversation for phone:', phone);
    console.log('Customer ID:', latestMessage?.customer_id);
    console.log('Registered customer name:', registeredCustomerName);
    console.log('Profile image URL:', profileImageUrl);

    acc[phone] = {
      messages: allMessages,
      latestIncoming: latestMessage,
      customerName: registeredCustomerName || undefined,
      customerId: latestMessage?.customer_id,
      profileImageUrl: profileImageUrl || null
    };

    return acc;
  }, {} as Record<string, {
    messages: ChatMessage[];
    latestIncoming: IncomingMessage;
    customerName?: string;
    customerId: string | null;
    profileImageUrl?: string | null;
  }>);

  // Incluir conversaciones de mensajes solo salientes
  sentMessages.forEach(sentMsg => {
    const phone = sentMsg.phone;
    const normalizedPhone = phone.replace(/[\s\-\(\)\+]/g, '');
    
    const existingConversation = Object.keys(conversationsByPhone).find(existingPhone => {
      const normalizedExisting = existingPhone.replace(/[\s\-\(\)\+]/g, '');
      return normalizedExisting === normalizedPhone || 
             normalizedExisting.endsWith(normalizedPhone) || 
             normalizedPhone.endsWith(normalizedExisting);
    });
    
    if (!existingConversation) {
      conversationsByPhone[phone] = {
        messages: [{
          id: sentMsg.id,
          message_content: sentMsg.message,
          message_type: (sentMsg.image_url ? 'image' : 'text') as 'text' | 'image' | 'document' | 'audio' | 'video',
          timestamp: sentMsg.sent_at,
          is_from_customer: false,
          media_url: sentMsg.image_url || undefined
        }],
        latestIncoming: null as any,
        customerName: undefined,
        customerId: sentMsg.customer_id,
        profileImageUrl: null
      };
    }
  });

  // Crear lista de chats para la columna izquierda
  const chatList = Object.entries(conversationsByPhone).map(([phone, conversation]) => {
    // Un cliente está registrado si tiene customer_id Y nombre registrado
    const isRegistered = !!(conversation.customerId && conversation.customerName);
    
    console.log('Creating chat list item for phone:', phone);
    console.log('Customer ID:', conversation.customerId);
    console.log('Customer name:', conversation.customerName);
    console.log('Is registered:', isRegistered);
    
    return {
      phone,
      customerName: conversation.customerName,
      lastMessage: conversation.messages[conversation.messages.length - 1]?.message_content || 'Sin mensajes',
      lastMessageTime: conversation.messages[conversation.messages.length - 1]?.timestamp || new Date().toISOString(),
      isRegistered,
      unreadCount: 0,
      profileImageUrl: conversation.profileImageUrl
    };
  }).sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime());

  console.log('Final chat list:', chatList.map(chat => ({ 
    phone: chat.phone, 
    customerName: chat.customerName, 
    isRegistered: chat.isRegistered 
  })));

  return {
    chatList,
    conversationsByPhone,
    isLoading,
    refetch
  };
}
