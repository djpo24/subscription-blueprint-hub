
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

        console.log('✅ Raw dispatch packages data:', data);

        // Get all package IDs to fetch bultos information
        const packageIds = (data || [])
          .map(dp => dp.packages?.id)
          .filter(Boolean);

        // Fetch bultos information for all packages
        const { data: packageLabelsData } = await supabase
          .from('package_labels')
          .select(`
            package_id,
            bultos!bulto_id (
              bulto_number
            )
          `)
          .in('package_id', packageIds);

        console.log('📦 Package labels data:', packageLabelsData);

        // Create a map of package_id to bulto numbers
        const packageBultosMap = new Map<string, number[]>();
        
        (packageLabelsData || []).forEach(label => {
          if (label.package_id && label.bultos?.bulto_number) {
            const existing = packageBultosMap.get(label.package_id) || [];
            existing.push(label.bultos.bulto_number);
            packageBultosMap.set(label.package_id, existing);
          }
        });

        // Transform data to match PackageInDispatch interface
        const transformedPackages = (data || []).map(dispatchPackage => {
          const pkg = dispatchPackage.packages;
          if (!pkg) return null;
          
          // Get bultos for this package and sort them
          const bultosNumbers = packageBultosMap.get(pkg.id) || [];
          const bultosString = bultosNumbers.length > 0 
            ? bultosNumbers.sort((a, b) => a - b).join(', ') 
            : null;
          
          const transformed = {
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
            bultos: bultosString,
            customers: pkg.customers
          };
          
          console.log('📦 Transformed package:', transformed);
          return transformed;
        }).filter(Boolean) as PackageInDispatch[];

        console.log('✅ Final transformed packages:', transformedPackages);
        return transformedPackages;
      } catch (error) {
        console.error('❌ Error in useDispatchPackages:', error);
        return [];
      }
    },
    enabled: !!dispatchId,
    refetchInterval: 30000,
  });
}
