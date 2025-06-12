
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
      
      // Filter packages that are "en_destino" or "delivered" and have amount_to_collect
      const eligiblePackages = packages?.filter(p => 
        (p.status === 'en_destino' || p.status === 'delivered') && 
        p.amount_to_collect && 
        p.amount_to_collect > 0
      ) || [];

      console.log('📦 [useFinancialData] Eligible packages (en_destino/delivered):', eligiblePackages.length);

      // Calculate total amount that should be collected from eligible packages
      const totalAmountToCollect = eligiblePackages.reduce((sum, p) => {
        return sum + (p.amount_to_collect || 0);
      }, 0);

      // Total actually collected from payments for eligible packages
      const totalCollected = payments?.reduce((sum, p) => {
        // Only count payments for eligible packages
        const isEligiblePackage = eligiblePackages.some(pkg => pkg.id === p.package_id);
        if (isEligiblePackage) {
          return sum + (p.amount || 0);
        }
        return sum;
      }, 0) || 0;
      
      // Pending collections = what should be collected - what was actually collected for eligible packages
      const pendingCollections = Math.max(0, totalAmountToCollect - totalCollected);
      
      // Count of eligible packages that still have pending amounts
      const totalPendingPackages = eligiblePackages.filter(p => {
        // Get payments for this specific package
        const packagePayments = payments?.filter(payment => payment.package_id === p.id) || [];
        const totalPaidForPackage = packagePayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
        
        // Package has pending amount if what should be collected > what was paid
        return (p.amount_to_collect || 0) > totalPaidForPackage;
      }).length;

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
      console.log('💰 [useFinancialData] Total to collect from eligible packages:', totalAmountToCollect);
      console.log('💰 [useFinancialData] Total collected from eligible packages:', totalCollected);
      console.log('⏳ [useFinancialData] Pending collections (en_destino/delivered only):', pendingCollections);
      console.log('📦 [useFinancialData] Eligible packages count:', eligiblePackages.length);

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
