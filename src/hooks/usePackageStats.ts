
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
        recibido: data.filter(p => p.status === 'recibido').length,
        bodega: data.filter(p => p.status === 'bodega').length,
        procesado: data.filter(p => p.status === 'procesado').length,
        transito: data.filter(p => p.status === 'transito').length,
        en_destino: data.filter(p => p.status === 'en_destino').length,
        delivered: data.filter(p => p.status === 'delivered').length,
        // Estados legacy para compatibilidad
        pending: data.filter(p => p.status === 'pending').length,
        inTransit: data.filter(p => p.status === 'transito').length, // Corregido: usar 'transito' en lugar de 'in_transit'
      };
      
      return stats;
    }
  });
}
