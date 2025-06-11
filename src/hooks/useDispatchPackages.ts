
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { PackageInDispatch } from '@/types/dispatch';

export function useDispatchPackages(dispatchId: string) {
  return useQuery({
    queryKey: ['dispatch-packages', dispatchId],
    queryFn: async (): Promise<PackageInDispatch[]> => {
      if (!dispatchId) return [];
      
      console.log('🔍 Fetching packages for dispatch:', dispatchId);
      
      try {
        const { data, error } = await supabase
          .from('dispatch_packages')
          .select(`
            *,
            packages!package_id (
              *,
              customers!customer_id (
                name,
                email,
                phone
              )
            )
          `)
          .eq('dispatch_id', dispatchId);

        if (error) {
          console.error('❌ Error fetching dispatch packages:', error);
          throw error;
        }

        // Transform data to match PackageInDispatch interface
        return (data || []).map(dispatchPackage => {
          const pkg = dispatchPackage.packages;
          if (!pkg) return null;
          
          return {
            id: pkg.id,
            tracking_number: pkg.tracking_number || '',
            origin: pkg.origin || '',
            destination: pkg.destination || '',
            status: pkg.status || 'pending',
            description: pkg.description || '',
            weight: pkg.weight,
            freight: pkg.freight,
            amount_to_collect: pkg.amount_to_collect,
            currency: pkg.currency,
            trip_id: pkg.trip_id,
            delivered_at: pkg.delivered_at,
            delivered_by: pkg.delivered_by,
            customers: pkg.customers
          };
        }).filter(Boolean) as PackageInDispatch[];
      } catch (error) {
        console.error('❌ Error in useDispatchPackages:', error);
        return [];
      }
    },
    enabled: !!dispatchId,
    refetchInterval: 30000,
  });
}
