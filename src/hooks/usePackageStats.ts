
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function usePackageStats() {
  return useQuery({
    queryKey: ['package-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('packages')
        .select('status');
      
      if (error) throw error;
      
      const stats = {
        total: data.length,
        pending: data.filter(p => p.status === 'pending').length,
        inTransit: data.filter(p => p.status === 'in_transit').length,
        delivered: data.filter(p => p.status === 'delivered').length
      };
      
      return stats;
    }
  });
}
