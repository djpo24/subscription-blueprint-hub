
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface FinancialSummary {
  totalCollected: number;
  totalPending: number;
  totalPayments: number;
  totalPendingPackages: number;
  totalFreight: number;
  pendingCollections: number;
  deliveredPackages: number;
  totalPackages: number;
}

export function useFinancialData() {
  return useQuery({
    queryKey: ['financial-data'],
    queryFn: async () => {
      // Get packages data
      const { data: packages, error: packagesError } = await supabase
        .from('packages')
        .select('*');

      if (packagesError) throw packagesError;

      // Get payments data
      const { data: payments, error: paymentsError } = await supabase
        .from('customer_payments')
        .select('*');

      if (paymentsError) throw paymentsError;

      // Calculate summary
      const totalPackages = packages?.length || 0;
      const deliveredPackages = packages?.filter(p => p.status === 'delivered').length || 0;
      const totalFreight = packages?.reduce((sum, p) => sum + (p.freight || 0), 0) || 0;
      const pendingCollections = packages?.reduce((sum, p) => {
        if (p.status !== 'delivered' && p.amount_to_collect) {
          return sum + p.amount_to_collect;
        }
        return sum;
      }, 0) || 0;

      const totalPayments = payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
      const totalCollected = totalPayments;
      const totalPending = pendingCollections;
      const totalPendingPackages = packages?.filter(p => p.status === 'pending').length || 0;

      const summary: FinancialSummary = {
        totalCollected,
        totalPending,
        totalPayments,
        totalPendingPackages,
        totalFreight,
        pendingCollections,
        deliveredPackages,
        totalPackages
      };

      return {
        summary,
        packages: packages || [],
        payments: payments || []
      };
    }
  });
}
