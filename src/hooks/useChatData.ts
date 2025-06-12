
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
      console.log('🔍 Fetching chat data with auto-responses...');
      
      try {
        // Fetch incoming messages - increased limit to 1000
        const { data: incomingData, error: incomingError } = await supabase
          .from('incoming_messages')
          .select(`
            *,
            customers (
              id,
              name,
              profile_image_url,
              phone,
              whatsapp_number
            )
          `)
          .order('timestamp', { ascending: false })
          .limit(1000);

        if (incomingError) {
          console.error('❌ Error fetching incoming messages:', incomingError);
          throw incomingError;
        }

        console.log('📥 Incoming messages raw data:', incomingData?.slice(0, 3));

        // Fetch sent messages (including auto-responses) - increased limit to 1000
        const { data: sentData, error: sentError } = await supabase
          .from('sent_messages')
          .select(`
            *,
            customers (
              id,
              name,
              profile_image_url,
              phone,
              whatsapp_number
            )
          `)
          .order('sent_at', { ascending: false })
          .limit(1000);

        if (sentError) {
          console.error('❌ Error fetching sent messages:', sentError);
          throw sentError;
        }

        console.log('📤 Sent messages raw data:', sentData?.slice(0, 3));

        // Fetch notification log for template messages - increased limit to 1000
        const { data: notificationData, error: notificationError } = await supabase
          .from('notification_log')
          .select(`
            *,
            customers (
              id,
              name,
              profile_image_url,
              phone,
              whatsapp_number
            )
          `)
          .in('notification_type', ['consulta_encomienda', 'package_arrival_notification', 'customer_service_followup'])
          .eq('status', 'sent')
          .order('sent_at', { ascending: false })
          .limit(1000);

        if (notificationError) {
          console.error('❌ Error fetching notifications:', notificationError);
          throw notificationError;
        }

        // Convert incoming messages to unified format
        const incomingMessages = (incomingData || []).map(msg => {
          console.log(`📨 Processing incoming message from ${msg.from_phone}:`, {
            hasCustomer: !!msg.customers,
            customerName: msg.customers?.name,
            customerId: msg.customer_id,
            customerData: msg.customers
          });

          return {
            id: msg.id,
            whatsapp_message_id: msg.whatsapp_message_id,
            from_phone: msg.from_phone,
            customer_id: msg.customer_id,
            message_type: msg.message_type,
            message_content: msg.message_content,
            media_url: msg.media_url,
            timestamp: msg.timestamp,
            is_from_customer: true,
            customers: msg.customers ? {
              name: msg.customers.name,
              profile_image_url: msg.customers.profile_image_url || undefined
            } : undefined
          } as IncomingMessage & { is_from_customer: boolean };
        });

        // Convert sent messages to unified format (including auto-responses)
        const sentMessages = (sentData || []).map(msg => {
          console.log(`📤 Processing sent message to ${msg.phone}:`, {
            hasCustomer: !!msg.customers,
            customerName: msg.customers?.name,
            customerId: msg.customer_id,
            customerData: msg.customers
          });

          return {
            id: `sent_${msg.id}`,
            whatsapp_message_id: msg.whatsapp_message_id,
            from_phone: msg.phone,
            customer_id: msg.customer_id,
            message_type: 'text' as const,
            message_content: msg.message,
            media_url: msg.image_url,
            timestamp: msg.sent_at,
            is_from_customer: false,
            customers: msg.customers ? {
              name: msg.customers.name,
              profile_image_url: msg.customers.profile_image_url || undefined
            } : undefined
          } as IncomingMessage & { is_from_customer: boolean };
        });

        // Convert template notifications to unified format
        const templateMessages = (notificationData || []).map(notification => ({
          id: `template_${notification.id}`,
          whatsapp_message_id: null,
          from_phone: '', // Will be populated from customer data
          customer_id: notification.customer_id,
          message_type: 'template' as const,
          message_content: `📋 Plantilla: ${notification.notification_type} - ${notification.message}`,
          media_url: null,
          timestamp: notification.sent_at || notification.created_at,
          is_from_customer: false,
          customers: notification.customers ? {
            name: notification.customers.name,
            profile_image_url: notification.customers.profile_image_url || undefined
          } : undefined
        } as IncomingMessage & { is_from_customer: boolean }));

        // For template messages, we need to get the customer's phone number
        for (const templateMsg of templateMessages) {
          if (templateMsg.customer_id) {
            const { data: customerData } = await supabase
              .from('customers')
              .select('whatsapp_number, phone')
              .eq('id', templateMsg.customer_id)
              .single();
            
            if (customerData) {
              templateMsg.from_phone = customerData.whatsapp_number || customerData.phone || '';
            }
          }
        }

        // Combine all messages and sort by timestamp
        const allMessages = [...incomingMessages, ...sentMessages, ...templateMessages]
          .filter(msg => msg.from_phone) // Only include messages with phone numbers
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        console.log('✅ Fetched messages with auto-responses:', {
          incoming: incomingMessages.length,
          sent: sentMessages.length,
          templates: templateMessages.length,
          total: allMessages.length
        });

        // Log sample of messages with customer data for debugging
        console.log('📋 Sample messages with customer data:', 
          allMessages.slice(0, 5).map(msg => ({
            phone: msg.from_phone,
            hasCustomer: !!msg.customers,
            customerName: msg.customers?.name,
            message: msg.message_content?.substring(0, 50)
          }))
        );

        return allMessages;
      } catch (error) {
        console.error('❌ Error in useChatData:', error);
        return [];
      }
    },
    refetchInterval: 3000, // Refresh every 3 seconds to show auto-responses quickly
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
      console.log(`👤 Creating conversation for ${phone}:`, {
        customerName,
        hasCustomerData: !!message.customers,
        customerId: message.customer_id
      });

      conversationsByPhone[phone] = {
        customerId: message.customer_id,
        customerName,
        messages: [],
        profileImageUrl: message.customers?.profile_image_url
      };
    }
    conversationsByPhone[phone].messages.push(message);
  });

  // Sort messages within each conversation by timestamp (newest first for display)
  Object.values(conversationsByPhone).forEach(conversation => {
    conversation.messages.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  });

  // Create chat list
  Object.entries(conversationsByPhone).forEach(([phone, conversation]) => {
    const lastMessage = conversation.messages[0];
    if (lastMessage) {
      const messageWithFlag = lastMessage as IncomingMessage & { is_from_customer?: boolean };
      let displayMessage = lastMessage.message_content || '';
      if (lastMessage.message_type === 'template') {
        displayMessage = `📋 ${displayMessage}`;
      } else if (messageWithFlag.is_from_customer === false) {
        displayMessage = `🤖 SARA: ${displayMessage}`;
      }

      console.log(`💬 Adding to chat list ${phone}:`, {
        customerName: conversation.customerName,
        customerId: conversation.customerId,
        lastMessage: displayMessage.substring(0, 30)
      });

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

  console.log('📊 Final chat list summary:', {
    totalChats: chatList.length,
    chatsWithNames: chatList.filter(c => c.customerName !== c.phone).length,
    chatsWithoutNames: chatList.filter(c => c.customerName === c.phone).length
  });

  return {
    chatList,
    conversationsByPhone,
    isLoading,
    refetch
  };
}
