
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function usePackagesByTrip(tripId: string) {
  return useQuery({
    queryKey: ['packages-by-trip', tripId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('packages')
        .select(`
          *,
          customers (
            name,
            email
          )
        `)
        .eq('trip_id', tripId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!tripId
  });
}

// Hook para invalidar manualmente las consultas de paquetes por viaje
export function useInvalidatePackagesByTrip() {
  const queryClient = useQueryClient();
  
  return (tripId?: string) => {
    if (tripId) {
      queryClient.invalidateQueries({ queryKey: ['packages-by-trip', tripId] });
    } else {
      queryClient.invalidateQueries({ queryKey: ['packages-by-trip'] });
    }
  };
}
