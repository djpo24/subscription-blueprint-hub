
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useTravelers() {
  return useQuery({
    queryKey: ['travelers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('travelers')
        .select('*')
        .order('first_name', { ascending: true });
      
      if (error) throw error;
      return data;
    }
  });
}
