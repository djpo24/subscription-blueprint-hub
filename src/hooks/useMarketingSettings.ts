
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useMarketingSettings() {
  return useQuery({
    queryKey: ['marketing-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('marketing_settings')
        .select('*')
        .limit(1)
        .single();

      if (error) {
        console.error('Error fetching marketing settings:', error);
        throw error;
      }

      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}
