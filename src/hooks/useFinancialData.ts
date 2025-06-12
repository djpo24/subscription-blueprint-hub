
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
      console.log('🔍 [useFinancialData] Fetching financial data...');

      // Get packages data with customer information
      const { data: packages, error: packagesError } = await supabase
        .from('packages')
        .select(`
          *,
          customers!packages_customer_id_fkey (
            name,
            phone
          )
        `);

      if (packagesError) {
        console.error('❌ [useFinancialData] Error fetching packages:', packagesError);
        throw packagesError;
      }

      // Get payments data
      const { data: payments, error: paymentsError } = await supabase
        .from('customer_payments')
        .select('*');

      if (paymentsError) {
        console.error('❌ [useFinancialData] Error fetching payments:', paymentsError);
        throw paymentsError;
      }

      console.log('📦 [useFinancialData] Packages found:', packages?.length || 0);
      console.log('💰 [useFinancialData] Payments found:', payments?.length || 0);

      // Calculate real totals based on actual data
      const totalPackages = packages?.length || 0;
      const deliveredPackages = packages?.filter(p => p.status === 'delivered').length || 0;
      
      // Total freight from all packages
      const totalFreight = packages?.reduce((sum, p) => sum + (p.freight || 0), 0) || 0;
      
      // Total amount that should be collected from delivered packages
      const totalAmountToCollect = packages?.reduce((sum, p) => {
        if (p.status === 'delivered' && p.amount_to_collect) {
          return sum + p.amount_to_collect;
        }
        return sum;
      }, 0) || 0;

      // Total actually collected from payments
      const totalCollected = payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
      
      // Pending collections = what should be collected - what was actually collected
      const pendingCollections = Math.max(0, totalAmountToCollect - totalCollected);
      
      // Count of packages that still have pending amounts
      const totalPendingPackages = packages?.filter(p => {
        if (p.status !== 'delivered' || !p.amount_to_collect) return false;
        
        // Get payments for this specific package
        const packagePayments = payments?.filter(payment => payment.package_id === p.id) || [];
        const totalPaidForPackage = packagePayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
        
        // Package has pending amount if what should be collected > what was paid
        return p.amount_to_collect > totalPaidForPackage;
      }).length || 0;

      const summary: FinancialSummary = {
        totalCollected,
        totalPending: pendingCollections,
        totalPayments: payments?.length || 0,
        totalPendingPackages,
        totalFreight,
        pendingCollections,
        deliveredPackages,
        totalPackages
      };

      console.log('📊 [useFinancialData] Summary calculated:', summary);
      console.log('💰 [useFinancialData] Total collected (real):', totalCollected);
      console.log('⏳ [useFinancialData] Pending collections (real):', pendingCollections);

      return {
        summary,
        packages: packages || [],
        payments: payments || []
      };
    },
    refetchInterval: 5000, // Refresh every 5 seconds to catch new payments
    retry: 3,
    retryDelay: 1000,
  });
}
