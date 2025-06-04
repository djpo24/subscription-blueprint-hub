
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useCustomersPendingCollection() {
  return useQuery({
    queryKey: ['customers-pending-collection'],
    queryFn: async () => {
      console.log('🔍 Fetching customers with pending collections...');
      
      const { data, error } = await supabase
        .rpc('get_collection_packages', {
          p_limit: 50,
          p_offset: 0
        });

      if (error) {
        console.error('❌ Error fetching pending collections:', error);
        throw error;
      }

      console.log('📊 Fetched pending collections:', data);
      return data || [];
    },
    refetchInterval: 30000, // Refrescar cada 30 segundos
  });
}
