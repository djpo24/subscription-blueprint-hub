import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook to get package counts for multiple customers at once
 * More efficient than making individual queries for each customer
 */
export function useCustomerPackageCounts(customerIds: string[]) {
  return useQuery({
    queryKey: ['customer-package-counts', customerIds.sort().join(',')],
    queryFn: async () => {
      if (!customerIds || customerIds.length === 0) {
        return {};
      }

      // Get all packages for these customers
      const { data: packages, error } = await supabase
        .from('packages')
        .select('customer_id')
        .in('customer_id', customerIds);

      if (error) {
        console.error('Error fetching customer package counts:', error);
        return {};
      }

      // Count packages per customer
      const counts: Record<string, number> = {};
      packages?.forEach(pkg => {
        counts[pkg.customer_id] = (counts[pkg.customer_id] || 0) + 1;
      });

      return counts;
    },
    enabled: customerIds.length > 0,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
}
