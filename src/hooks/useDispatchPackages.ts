
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { PackageInDispatch } from '@/types/dispatch';

export function useDispatchPackages(dispatchId: string) {
  return useQuery({
    queryKey: ['dispatch-packages', dispatchId],
    queryFn: async (): Promise<PackageInDispatch[]> => {
      const { data, error } = await supabase
        .from('dispatch_packages')
        .select(`
          packages (
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
            customers (
              name,
              email
            )
          )
        `)
        .eq('dispatch_id', dispatchId);
      
      if (error) throw error;
      
      return data?.map(item => item.packages).filter(Boolean) || [];
    },
    enabled: !!dispatchId
  });
}
