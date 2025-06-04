
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useCustomersPendingCollection() {
  return useQuery({
    queryKey: ['customers-pending-collection'],
    queryFn: async () => {
      console.log('🔍 Fetching customers with pending collections...');
      
      try {
        // Use a direct SQL query instead of the ambiguous RPC function
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
          .order('delivered_at', { ascending: false, nullsLast: true })
          .order('created_at', { ascending: false })
          .limit(50);

        if (error) {
          console.error('❌ Error fetching pending collections:', error);
          throw new Error(`Error en la base de datos: ${error.message}`);
        }

        console.log('📊 Raw packages data:', data);

        if (!Array.isArray(data)) {
          console.warn('⚠️ Data is not an array, returning empty array');
          return [];
        }

        // Transform the data to match the expected format and calculate pending amounts
        const transformedData = await Promise.all(
          data.map(async (pkg) => {
            // Get total paid for this package
            const { data: payments, error: paymentsError } = await supabase
              .from('customer_payments')
              .select('amount')
              .eq('package_id', pkg.id);

            if (paymentsError) {
              console.warn('⚠️ Error fetching payments for package:', pkg.id, paymentsError);
            }

            const totalPaid = (payments || []).reduce((sum, payment) => sum + (payment.amount || 0), 0);
            const pendingAmount = Math.max(0, (pkg.amount_to_collect || 0) - totalPaid);

            // Only include packages with pending amounts > 0
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
        );

        // Filter out null entries (packages with no pending amount)
        const filteredData = transformedData.filter(item => item !== null);

        console.log('✅ Transformed pending collections data:', filteredData);
        return filteredData;
      } catch (error) {
        console.error('❌ Error in useCustomersPendingCollection:', error);
        throw error;
      }
    },
    refetchInterval: 30000, // Refrescar cada 30 segundos
    retry: 3, // Reintentar 3 veces en caso de error
    retryDelay: 1000, // Esperar 1 segundo entre reintentos
  });
}
