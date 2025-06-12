
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useRouteFreightRates() {
  return useQuery({
    queryKey: ['route-freight-rates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('route_freight_rates')
        .select('*')
        .eq('is_active', true)
        .order('origin', { ascending: true })
        .order('destination', { ascending: true })
        .order('effective_from', { ascending: false });

      if (error) {
        console.error('Error fetching route freight rates:', error);
        throw error;
      }

      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}
