
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface CustomerFinancialData {
  totalFreight: number;
  totalPending: number;
  totalCollected: number;
  pendingDeliveryPackages: any[];
  pendingPaymentPackages: any[];
  collectedPackages: any[];
}

export function useCustomerFinancialData(customerId: string) {
  const { data: financialData, isLoading, error } = useQuery({
    queryKey: ['customer-financial-data', customerId],
    queryFn: async (): Promise<CustomerFinancialData> => {
      console.log('🔍 Fetching financial data for customer:', customerId);

      // Get customer packages
      const { data: packages, error: packagesError } = await supabase
        .from('packages')
        .select('*')
        .eq('customer_id', customerId);

      if (packagesError) {
        console.error('❌ Error fetching customer packages:', packagesError);
        throw packagesError;
      }

      // Get customer payments
      const { data: payments, error: paymentsError } = await supabase
        .from('customer_payments')
        .select('*')
        .in('package_id', packages?.map(p => p.id) || []);

      if (paymentsError) {
        console.error('❌ Error fetching customer payments:', paymentsError);
        throw paymentsError;
      }

      console.log('📦 Customer packages found:', packages?.length || 0);
      console.log('💰 Customer payments found:', payments?.length || 0);

      // Calculate totals
      const totalFreight = packages?.reduce((sum, p) => sum + (p.freight || 0), 0) || 0;
      
      // Pending delivery packages (not delivered yet)
      const pendingDeliveryPackages = packages?.filter(p => 
        p.status !== 'delivered' && p.status !== 'cancelled'
      ) || [];

      // Packages that are delivered but have pending payments
      const deliveredPackages = packages?.filter(p => 
        (p.status === 'delivered' || p.status === 'en_destino') && 
        p.amount_to_collect && 
        p.amount_to_collect > 0
      ) || [];

      // Calculate payments for each package
      const packagesWithPayments = deliveredPackages.map(pkg => {
        const packagePayments = payments?.filter(p => p.package_id === pkg.id) || [];
        const totalPaid = packagePayments.reduce((sum, p) => sum + (p.amount || 0), 0);
        
        return {
          ...pkg,
          totalPaid,
          pendingAmount: (pkg.amount_to_collect || 0) - totalPaid
        };
      });

      const pendingPaymentPackages = packagesWithPayments.filter(p => p.pendingAmount > 0);
      const collectedPackages = packagesWithPayments.filter(p => p.pendingAmount <= 0);

      const totalCollected = payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;
      const totalPending = pendingPaymentPackages.reduce((sum, p) => sum + p.pendingAmount, 0);

      const result: CustomerFinancialData = {
        totalFreight,
        totalPending,
        totalCollected,
        pendingDeliveryPackages,
        pendingPaymentPackages,
        collectedPackages
      };

      console.log('📊 Customer financial summary:', result);
      return result;
    },
    enabled: !!customerId,
    refetchInterval: 30000,
  });

  return {
    financialData,
    isLoading,
    error
  };
}
