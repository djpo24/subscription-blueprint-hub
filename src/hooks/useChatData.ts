
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
        // Primero obtenemos todos los clientes registrados para hacer lookup por teléfono
        const { data: allCustomers, error: customersError } = await supabase
          .from('customers')
          .select('id, name, phone, whatsapp_number, profile_image_url');

        if (customersError) {
          console.error('❌ Error fetching customers:', customersError);
          throw customersError;
        }

        // Crear un mapa de teléfonos a clientes para lookup rápido
        const customersByPhone = new Map<string, any>();
        allCustomers?.forEach(customer => {
          // Normalizar números de teléfono para comparación
          const normalizePhone = (phone: string) => phone?.replace(/[\s\-\(\)\+]/g, '') || '';
          
          if (customer.phone) {
            const normalizedPhone = normalizePhone(customer.phone);
            customersByPhone.set(normalizedPhone, customer);
          }
          if (customer.whatsapp_number) {
            const normalizedWhatsapp = normalizePhone(customer.whatsapp_number);
            customersByPhone.set(normalizedWhatsapp, customer);
          }
        });

        

        // Fetch incoming messages
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

        // Fetch sent messages
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

        // Fetch notification log
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

        // Función para encontrar cliente por teléfono
        const findCustomerByPhone = (phone: string) => {
          const normalizedPhone = phone?.replace(/[\s\-\(\)\+]/g, '') || '';
          
          // Buscar coincidencia exacta
          let customer = customersByPhone.get(normalizedPhone);
          if (customer) {
            return customer;
          }

          // Buscar coincidencias parciales
          for (const [registeredPhone, customerData] of customersByPhone) {
            if (registeredPhone.endsWith(normalizedPhone) || normalizedPhone.endsWith(registeredPhone)) {
              return customerData;
            }
          }

          return null;
        };

        // Procesar mensajes entrantes con lookup mejorado
        const incomingMessages = (incomingData || []).map(msg => {
          let customerData = msg.customers;
          let customerId = msg.customer_id;

          // Si no hay customer_id o customers, intentar encontrar por teléfono
          if (!customerId || !customerData) {
            const foundCustomer = findCustomerByPhone(msg.from_phone);
            if (foundCustomer) {
              customerData = {
                id: foundCustomer.id,
                name: foundCustomer.name,
                profile_image_url: foundCustomer.profile_image_url,
                phone: foundCustomer.phone,
                whatsapp_number: foundCustomer.whatsapp_number
              };
              customerId = foundCustomer.id;
            }
          }

          return {
            id: msg.id,
            whatsapp_message_id: msg.whatsapp_message_id,
            from_phone: msg.from_phone,
            customer_id: customerId,
            message_type: msg.message_type,
            message_content: msg.message_content,
            media_url: msg.media_url,
            timestamp: msg.timestamp,
            is_from_customer: true,
            customers: customerData
          } as IncomingMessage & { is_from_customer: boolean };
        });

        // Procesar mensajes enviados con lookup mejorado
        const sentMessages = (sentData || []).map(msg => {
          let customerData = msg.customers;
          let customerId = msg.customer_id;

          if (!customerId || !customerData) {
            const foundCustomer = findCustomerByPhone(msg.phone);
            if (foundCustomer) {
              customerData = {
                id: foundCustomer.id,
                name: foundCustomer.name,
                profile_image_url: foundCustomer.profile_image_url,
                phone: foundCustomer.phone,
                whatsapp_number: foundCustomer.whatsapp_number
              };
              customerId = foundCustomer.id;
            }
          }

          return {
            id: `sent_${msg.id}`,
            whatsapp_message_id: msg.whatsapp_message_id,
            from_phone: msg.phone,
            customer_id: customerId,
            message_type: 'text' as const,
            message_content: msg.message,
            media_url: msg.image_url,
            timestamp: msg.sent_at,
            is_from_customer: false,
            customers: customerData
          } as IncomingMessage & { is_from_customer: boolean };
        });

        // Procesar notificaciones template
        const templateMessages = (notificationData || []).map(notification => {
          let fromPhone = '';
          let customerData = notification.customers;

          if (notification.customers) {
            fromPhone = notification.customers.whatsapp_number || notification.customers.phone || '';
            customerData = {
              id: notification.customers.id,
              name: notification.customers.name,
              profile_image_url: notification.customers.profile_image_url,
              phone: notification.customers.phone,
              whatsapp_number: notification.customers.whatsapp_number
            };
          }

          return {
            id: `template_${notification.id}`,
            whatsapp_message_id: null,
            from_phone: fromPhone,
            customer_id: notification.customer_id,
            message_type: 'template' as const,
            message_content: `📋 Plantilla: ${notification.notification_type} - ${notification.message}`,
            media_url: null,
            timestamp: notification.sent_at || notification.created_at,
            is_from_customer: false,
            customers: customerData
          } as IncomingMessage & { is_from_customer: boolean };
        });

        // Combinar todos los mensajes
        const allMessages = [...incomingMessages, ...sentMessages, ...templateMessages]
          .filter(msg => msg.from_phone)
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());


        return allMessages;
      } catch (error) {
        console.error('❌ Error in useChatData:', error);
        return [];
      }
    },
    refetchInterval: 30000, // 30 segundos en lugar de 3
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
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
