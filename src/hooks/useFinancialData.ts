
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useFinancialData() {
  return useQuery({
    queryKey: ['financial-data'],
    queryFn: async () => {
      console.log('🔍 Fetching financial data...');
      
      try {
        // Get collected payments
        const { data: paymentsData, error: paymentsError } = await supabase
          .from('customer_payments')
          .select(`
            id,
            amount,
            currency,
            payment_date,
            payment_method
          `)
          .order('payment_date', { ascending: false });

        if (paymentsError) {
          console.error('❌ Error fetching payments:', paymentsError);
          throw paymentsError;
        }

        // Get pending packages
        const { data: pendingData, error: pendingError } = await supabase
          .from('packages')
          .select(`
            id,
            amount_to_collect,
            currency,
            customers (
              name,
              phone
            )
          `)
          .gt('amount_to_collect', 0)
          .neq('status', 'delivered');

        if (pendingError) {
          console.error('❌ Error fetching pending packages:', pendingError);
          throw pendingError;
        }

        // Calculate totals
        const collectedTotal = paymentsData?.reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0;
        const pendingTotal = pendingData?.reduce((sum, pkg) => sum + (pkg.amount_to_collect || 0), 0) || 0;

        return {
          collected: {
            total: collectedTotal,
            payments: paymentsData || []
          },
          pending: {
            total: pendingTotal,
            packages: pendingData || []
          }
        };
      } catch (error) {
        console.error('❌ Error in useFinancialData:', error);
        return {
          collected: { total: 0, payments: [] },
          pending: { total: 0, packages: [] }
        };
      }
    },
    refetchInterval: 30000,
  });
}
