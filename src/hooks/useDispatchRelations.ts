
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { DispatchRelation } from '@/types/supabase-temp';

export function useDispatchRelations(selectedDate?: Date) {
  return useQuery({
    queryKey: ['dispatch-relations', selectedDate?.toISOString()],
    queryFn: async (): Promise<DispatchRelation[]> => {
      console.log('🔍 Fetching dispatch relations...');
      
      try {
        let query = supabase
          .from('dispatch_relations')
          .select('*')
          .order('dispatch_date', { ascending: false });

        if (selectedDate) {
          const dateString = selectedDate.toISOString().split('T')[0];
          query = query.eq('dispatch_date', dateString);
        }

        const { data, error } = await query;

        if (error) {
          console.error('❌ Error fetching dispatch relations:', error);
          throw error;
        }

        // Transform data to match expected interface
        return (data || []).map(dispatch => ({
          ...dispatch,
          status: dispatch.status || 'pending',
          total_packages: 0, // Default values since these don't exist in DB
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
