
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface FinancesData {
  totalCollected: number;
  totalPending: number;
  totalPayments: number;
  totalPendingPackages: number;
  totalFreight: number;
  pendingCollections: any[];
  deliveredPackages: any[];
  totalPackages: number;
}

export function useFinancesData(): { data: FinancesData; isLoading: boolean } {
  const { data, isLoading } = useQuery({
    queryKey: ['finances-data'],
    queryFn: async (): Promise<FinancesData> => {
      console.log('🔍 Fetching finances data...');
      
      try {
        // Fetch delivered packages with amounts to collect
        const { data: deliveredPackages, error: deliveredError } = await supabase
          .from('packages')
          .select(`
            *,
            customers!customer_id (
              name,
              phone
            )
          `)
          .eq('status', 'delivered')
          .not('amount_to_collect', 'is', null)
          .gt('amount_to_collect', 0);

        if (deliveredError) {
          console.error('❌ Error fetching delivered packages:', deliveredError);
          throw deliveredError;
        }

        // Fetch all payments
        const { data: payments, error: paymentsError } = await supabase
          .from('customer_payments')
          .select('*');

        if (paymentsError) {
          console.error('❌ Error fetching payments:', paymentsError);
          throw paymentsError;
        }

        // Fetch all packages for total stats
        const { data: allPackages, error: allError } = await supabase
          .from('packages')
          .select('*');

        if (allError) {
          console.error('❌ Error fetching all packages:', allError);
          throw allError;
        }

        // Calculate totals
        const totalCollected = (payments || []).reduce((sum, payment) => sum + payment.amount, 0);
        const totalPending = (deliveredPackages || []).reduce((sum, pkg) => sum + (pkg.amount_to_collect || 0), 0) - totalCollected;
        const totalPayments = (payments || []).length;
        const totalPendingPackages = (deliveredPackages || []).filter(pkg => (pkg.amount_to_collect || 0) > 0).length;
        const totalFreight = (allPackages || []).reduce((sum, pkg) => sum + (pkg.freight || 0), 0);
        const totalPackages = (allPackages || []).length;

        // Get packages with pending collections
        const pendingCollections = (deliveredPackages || []).filter(pkg => {
          const packagePayments = (payments || []).filter(p => p.package_id === pkg.id);
          const totalPaid = packagePayments.reduce((sum, p) => sum + p.amount, 0);
          return (pkg.amount_to_collect || 0) > totalPaid;
        });

        return {
          totalCollected,
          totalPending,
          totalPayments,
          totalPendingPackages,
          totalFreight,
          pendingCollections,
          deliveredPackages: deliveredPackages || [],
          totalPackages
        };
      } catch (error) {
        console.error('❌ Error in useFinancesData:', error);
        return {
          totalCollected: 0,
          totalPending: 0,
          totalPayments: 0,
          totalPendingPackages: 0,
          totalFreight: 0,
          pendingCollections: [],
          deliveredPackages: [],
          totalPackages: 0
        };
      }
    },
    refetchInterval: 30000,
  });

  return {
    data: data || {
      totalCollected: 0,
      totalPending: 0,
      totalPayments: 0,
      totalPendingPackages: 0,
      totalFreight: 0,
      pendingCollections: [],
      deliveredPackages: [],
      totalPackages: 0
    },
    isLoading
  };
}
