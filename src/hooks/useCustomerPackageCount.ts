import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook to get the total count of packages for a specific customer
 * Used to determine if this is their first package ever in the system
 */
export function useCustomerPackageCount(customerId: string | undefined) {
  return useQuery({
    queryKey: ['customer-package-count', customerId],
    queryFn: async () => {
      if (!customerId) {
        return 0;
      }

      const { count, error } = await supabase
        .from('packages')
        .select('*', { count: 'exact', head: true })
        .eq('customer_id', customerId);

      if (error) {
        console.error('Error fetching customer package count:', error);
        return 0;
      }

      return count || 0;
    },
    enabled: !!customerId,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
}
