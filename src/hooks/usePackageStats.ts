
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

      const stats = data.reduce((acc, pkg) => {
        acc.total++;
        if (pkg.status) {
          acc[pkg.status] = (acc[pkg.status] || 0) + 1;
        }
        return acc;
      }, {
        total: 0,
        recibido: 0,
        bodega: 0,
        procesado: 0,
        transito: 0,
        en_destino: 0,
        delivered: 0,
        pending: 0,
        inTransit: 0
      });

      return stats;
    }
  });
}
