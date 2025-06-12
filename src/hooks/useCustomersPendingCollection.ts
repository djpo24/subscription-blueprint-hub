
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useCustomersPendingCollection() {
  return useQuery({
    queryKey: ['customers-pending-collection'],
    queryFn: async () => {
      console.log('🔍 [useCustomersPendingCollection] Fetching customers with pending collections...');
      
      try {
        // Get delivered packages with customer data
        const { data, error } = await supabase
          .from('packages')
          .select(`
            id,
            tracking_number,
            destination,
            status,
            amount_to_collect,
            delivered_at,
            created_at,
            currency,
            customers (
              name,
              phone
            )
          `)
          .eq('status', 'delivered')
          .gt('amount_to_collect', 0)
          .order('delivered_at', { ascending: false, nullsFirst: false })
          .order('created_at', { ascending: false })
          .limit(50);

        if (error) {
          console.error('❌ [useCustomersPendingCollection] Error fetching packages:', error);
          throw new Error(`Error en la base de datos: ${error.message}`);
        }

        if (!Array.isArray(data)) {
          console.warn('⚠️ [useCustomersPendingCollection] Data is not an array, returning empty array');
          return [];
        }

        // Get all payments to calculate real pending amounts
        const { data: allPayments, error: paymentsError } = await supabase
          .from('customer_payments')
          .select('package_id, amount');

        if (paymentsError) {
          console.warn('⚠️ [useCustomersPendingCollection] Error fetching payments:', paymentsError);
        }

        const payments = allPayments || [];
        console.log('💰 [useCustomersPendingCollection] Total payments found:', payments.length);

        // Transform data and calculate real pending amounts
        const transformedData = data
          .map((pkg) => {
            // Calculate total paid for this specific package
            const packagePayments = payments.filter(p => p.package_id === pkg.id);
            const totalPaid = packagePayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
            const pendingAmount = Math.max(0, (pkg.amount_to_collect || 0) - totalPaid);

            console.log(`📦 [useCustomersPendingCollection] Package ${pkg.tracking_number}: should collect ${pkg.amount_to_collect}, paid ${totalPaid}, pending ${pendingAmount}`);

            // Only include packages with actual pending amounts > 0
            if (pendingAmount <= 0) {
              return null;
            }

            return {
              package_id: pkg.id,
              tracking_number: pkg.tracking_number,
              customer_name: pkg.customers?.name || 'N/A',
              customer_phone: pkg.customers?.phone || 'N/A',
              destination: pkg.destination,
              package_status: pkg.status,
              pending_amount: pendingAmount,
              delivery_date: pkg.delivered_at,
              created_at: pkg.created_at,
              currency: pkg.currency || 'COP'
            };
          })
          .filter(item => item !== null); // Remove packages with no pending amount

        console.log('✅ [useCustomersPendingCollection] Final pending collections:', transformedData.length);
        
        // Calculate total pending amount for display
        const totalPendingAmount = transformedData.reduce((sum, item) => sum + (item?.pending_amount || 0), 0);
        console.log('💰 [useCustomersPendingCollection] Total pending amount:', totalPendingAmount);

        return transformedData;
      } catch (error) {
        console.error('❌ [useCustomersPendingCollection] Error:', error);
        throw error;
      }
    },
    refetchInterval: 5000, // Refresh every 5 seconds to catch new payments
    retry: 3,
    retryDelay: 1000,
  });
}
