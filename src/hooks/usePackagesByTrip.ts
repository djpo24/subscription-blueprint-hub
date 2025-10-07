
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function usePackagesByTrip(tripId: string) {
  return useQuery({
    queryKey: ['packages-by-trip', tripId],
    queryFn: async () => {
      // First get packages for this trip
      const { data: packages, error: packagesError } = await supabase
        .from('packages')
        .select('*')
        .eq('trip_id', tripId)
        .order('created_at', { ascending: false })
        .range(0, 999999);
      
      if (packagesError) throw packagesError;
      
      if (!packages || packages.length === 0) {
        return [];
      }
      
      // Then get customer details for each package
      const packagesWithCustomers = await Promise.all(
        packages.map(async (pkg) => {
          const { data: customer } = await supabase
            .from('customers')
            .select('name, email')
            .eq('id', pkg.customer_id)
            .single();
          
          return {
            ...pkg,
            customers: customer || { name: 'N/A', email: 'N/A' }
          };
        })
      );
      
      return packagesWithCustomers;
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
