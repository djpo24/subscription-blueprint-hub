
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { DispatchRelation } from '@/types/supabase-temp';

export function useDispatchRelations() {
  return useQuery({
    queryKey: ['dispatch-relations'],
    queryFn: async (): Promise<DispatchRelation[]> => {
      console.log('🔍 Fetching dispatch relations...');
      
      try {
        const { data, error } = await supabase
          .from('dispatch_relations')
          .select('*')
          .order('dispatch_date', { ascending: false });

        if (error) {
          console.error('❌ Error fetching dispatch relations:', error);
          throw error;
        }

        // Transform data to include calculated fields
        return (data || []).map(dispatch => ({
          ...dispatch,
          total_packages: 0,
          total_weight: 0,
          total_freight: 0,
          total_amount_to_collect: 0,
          pending_count: 0,
          delivered_count: 0
        }));
      } catch (error) {
        console.error('❌ Error in useDispatchRelations:', error);
        return [];
      }
    },
    refetchInterval: 30000,
  });
}
