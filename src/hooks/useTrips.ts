
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useTrips() {
  return useQuery({
    queryKey: ['trips'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('trips')
        .select(`
          *,
          travelers:traveler_id (
            id,
            first_name,
            last_name,
            phone
          )
        `)
        .order('trip_date', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });
}
