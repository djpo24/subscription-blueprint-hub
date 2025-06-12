
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface CustomerPackage {
  id: string;
  tracking_number: string;
  description: string;
  status: string;
  origin: string;
  destination: string;
  freight: number;
  amount_to_collect: number;
  weight: number;
  created_at: string;
  delivered_at: string;
}

export function useCustomerPackagesData(customerId: string) {
  const { data: packages = [], isLoading, error } = useQuery({
    queryKey: ['customer-packages', customerId],
    queryFn: async (): Promise<CustomerPackage[]> => {
      console.log('🔍 Fetching packages for customer:', customerId);
      
      const { data, error } = await supabase
        .from('packages')
        .select('*')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching customer packages:', error);
        throw error;
      }

      console.log('📦 Customer packages fetched:', data?.length || 0);
      return data || [];
    },
    enabled: !!customerId,
    refetchInterval: 30000,
  });

  return {
    packages,
    isLoading,
    error
  };
}
