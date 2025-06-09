
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { PackageInDispatch } from '@/types/dispatch';

export function useDispatchPackages(dispatchId: string) {
  return useQuery({
    queryKey: ['dispatch-packages', dispatchId],
    queryFn: async (): Promise<PackageInDispatch[]> => {
      // First get the package IDs from dispatch_packages
      const { data: dispatchPackages, error: dispatchError } = await supabase
        .from('dispatch_packages')
        .select('package_id')
        .eq('dispatch_id', dispatchId);
      
      if (dispatchError) throw dispatchError;
      
      if (!dispatchPackages || dispatchPackages.length === 0) {
        return [];
      }
      
      const packageIds = dispatchPackages.map(dp => dp.package_id);
      
      // Then get the package details including customer_id, delivered_at, and delivered_by
      const { data: packages, error: packagesError } = await supabase
        .from('packages')
        .select(`
          id,
          tracking_number,
          origin,
          destination,
          status,
          description,
          weight,
          freight,
          amount_to_collect,
          currency,
          trip_id,
          customer_id,
          delivered_at,
          delivered_by
        `)
        .in('id', packageIds);
      
      if (packagesError) throw packagesError;
      
      // Get customer details for each package
      const packagesWithCustomers = await Promise.all(
        (packages || []).map(async (pkg) => {
          const { data: customer } = await supabase
            .from('customers')
            .select('name, email, phone')
            .eq('id', pkg.customer_id)
            .single();
          
          return {
            ...pkg,
            delivered_at: pkg.delivered_at,
            delivered_by: pkg.delivered_by,
            customers: customer || { name: 'N/A', email: 'N/A', phone: 'N/A' }
          };
        })
      );
      
      return packagesWithCustomers;
    },
    enabled: !!dispatchId,
    refetchOnWindowFocus: true,
    refetchInterval: 20000, // Refetch cada 20 segundos
    staleTime: 5000 // Los datos se consideran obsoletos después de 5 segundos
  });
}
