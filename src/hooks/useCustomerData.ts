
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Customer {
  id: string;
  name: string;
  phone: string;
  whatsapp_number?: string;
  email: string;
  profile_image_url?: string;
}

export function useCustomerData(customerId: string | null) {
  const { data: customer, isLoading, refetch } = useQuery({
    queryKey: ['customer', customerId],
    queryFn: async (): Promise<Customer | null> => {
      if (!customerId) return null;
      
      console.log('Fetching customer data for ID:', customerId);
      
      const { data, error } = await supabase
        .from('customers')
        .select('id, name, phone, whatsapp_number, email, profile_image_url')
        .eq('id', customerId)
        .single();
      
      if (error) {
        console.error('Error fetching customer:', error);
        return null;
      }
      
      console.log('Customer data fetched:', data);
      console.log('Profile image URL from customer data:', data?.profile_image_url);
      
      // Después de obtener el cliente, vincular mensajes existentes si es necesario
      if (data) {
        await linkExistingMessages(data);
      }
      
      return data;
    },
    enabled: !!customerId,
    // Refetch more frequently to catch profile updates
    refetchInterval: 30000,
  });

  const linkExistingMessages = async (customerData: Customer) => {
    const phoneToCheck = customerData.whatsapp_number || customerData.phone;
    
    if (!phoneToCheck) return;
    
    // Normalizar el número de teléfono removiendo caracteres especiales
    const normalizedPhone = phoneToCheck.replace(/[\s\-\(\)\+]/g, '');
    
    console.log('Checking for unlinked messages with phone:', phoneToCheck);
    
    // Buscar mensajes que no estén vinculados a un cliente pero que tengan el mismo número
    const { data: unlinkedMessages, error } = await supabase
      .from('incoming_messages')
      .select('id, from_phone')
      .is('customer_id', null);
    
    if (error) {
      console.error('Error fetching unlinked messages:', error);
      return;
    }
    
    // Filtrar mensajes que coincidan con el número del cliente
    const messagesToLink = unlinkedMessages.filter(message => {
      const messagePhone = message.from_phone.replace(/[\s\-\(\)\+]/g, '');
      return messagePhone === normalizedPhone || 
             messagePhone.endsWith(normalizedPhone) || 
             normalizedPhone.endsWith(messagePhone);
    });
    
    if (messagesToLink.length > 0) {
      console.log(`Linking ${messagesToLink.length} messages to customer ${customerData.name}`);
      
      // Actualizar todos los mensajes encontrados para vincularlos al cliente
      const { error: updateError } = await supabase
        .from('incoming_messages')
        .update({ customer_id: customerData.id })
        .in('id', messagesToLink.map(msg => msg.id));
      
      if (updateError) {
        console.error('Error linking messages to customer:', updateError);
      } else {
        console.log('Successfully linked messages to customer');
      }
    }
  };

  return {
    customer,
    isLoading,
    refetch,
    getPhoneNumber: () => customer?.whatsapp_number || customer?.phone || null
  };
}
