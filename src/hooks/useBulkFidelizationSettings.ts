import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useBulkFidelizationSettings() {
  return useQuery({
    queryKey: ['bulk-fidelization-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bulk_fidelization_settings')
        .select('*')
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching bulk fidelization settings:', error);
        throw error;
      }

      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
}
