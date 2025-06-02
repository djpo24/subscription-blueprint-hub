
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
  const { data: customer, isLoading } = useQuery({
    queryKey: ['customer', customerId],
    queryFn: async (): Promise<Customer | null> => {
      if (!customerId) return null;
      
      const { data, error } = await supabase
        .from('customers')
        .select('id, name, phone, whatsapp_number, email, profile_image_url')
        .eq('id', customerId)
        .single();
      
      if (error) {
        console.error('Error fetching customer:', error);
        return null;
      }
      
      return data;
    },
    enabled: !!customerId,
  });

  return {
    customer,
    isLoading,
    getPhoneNumber: () => customer?.whatsapp_number || customer?.phone || null
  };
}
