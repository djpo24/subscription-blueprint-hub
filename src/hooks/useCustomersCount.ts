
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useCustomersCount() {
  return useQuery({
    queryKey: ['customers-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('customers')
        .select('*', { count: 'exact' });

      if (error) throw error;
      return count || 0;
    }
  });
}
