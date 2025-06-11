
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface DispatchRelation {
  id: string;
  dispatch_date: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  status: string;
  total_packages: number;
  total_weight: number;
  total_freight: number;
  total_amount_to_collect: number;
  pending_count: number;
  delivered_count: number;
}

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

        // Transform data to match expected interface with required fields
        return (data || []).map(dispatch => ({
          ...dispatch,
          status: 'pending', // Default status since it doesn't exist in DB
          total_packages: 0, // Default values since these don't exist in DB
          total_weight: 0,
          total_freight: 0,
          total_amount_to_collect: 0,
          pending_count: 0,
          delivered_count: 0,
          created_at: dispatch.created_at || new Date().toISOString(),
          updated_at: dispatch.updated_at || new Date().toISOString()
        }));
      } catch (error) {
        console.error('❌ Error in useDispatchRelations:', error);
        return [];
      }
    },
    refetchInterval: 30000,
  });
}

// Export the useDispatchPackages function
export { useDispatchPackages } from './useDispatchPackages';
