
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface CustomerPendingCollection {
  id: string;
  customer_name: string;
  phone: string;
  email: string;
  total_packages: number;
  total_pending_amount: number;
  last_delivery_date: string;
  package_numbers: string;
}

export function useCustomersPendingCollection() {
  return useQuery({
    queryKey: ['customers-pending-collection'],
    queryFn: async () => {
      console.log('Fetching customers with pending collections...');
      
      const { data, error } = await supabase
        .from('customers_pending_collection')
        .select('*');
      
      if (error) {
        console.error('Error fetching customers pending collection:', error);
        throw error;
      }
      
      console.log('Customers pending collection data:', data);
      return data as CustomerPendingCollection[];
    },
  });
}
