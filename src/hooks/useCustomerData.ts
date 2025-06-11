
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Customer } from '@/types/supabase-temp';

export function useCustomerData() {
  return useQuery({
    queryKey: ['customer-data'],
    queryFn: async (): Promise<Customer[]> => {
      console.log('🔍 Fetching customer data...');
      
      try {
        const { data, error } = await supabase
          .from('customers')
          .select('*')
          .order('name');

        if (error) {
          console.error('❌ Error fetching customer data:', error);
          throw error;
        }

        return data || [];
      } catch (error) {
        console.error('❌ Error in useCustomerData:', error);
        return [];
      }
    },
    refetchInterval: 30000,
  });
}
