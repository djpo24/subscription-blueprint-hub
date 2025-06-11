
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Traveler } from '@/types/supabase-temp';

export function useAvailableTravelers() {
  return useQuery({
    queryKey: ['available-travelers'],
    queryFn: async (): Promise<Traveler[]> => {
      const { data, error } = await supabase
        .from('travelers')
        .select('*')
        .order('first_name');

      if (error) {
        console.error('Error fetching travelers:', error);
        throw error;
      }

      return (data || []).map(traveler => ({
        ...traveler,
        user_profiles: undefined // Remove user_profiles since it doesn't exist in this query
      }));
    }
  });
}
