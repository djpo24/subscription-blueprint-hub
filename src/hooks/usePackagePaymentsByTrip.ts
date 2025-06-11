
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function usePackagePaymentsByTrip(tripId?: string) {
  return useQuery({
    queryKey: ['package-payments-by-trip', tripId],
    queryFn: async () => {
      if (!tripId) return { deliveredPackages: [], paymentsByPackage: {} };

      console.log('🔍 Fetching package payments for trip:', tripId);
      
      try {
        // Fetch delivered packages for the trip
        const { data: packages, error: packagesError } = await supabase
          .from('packages')
          .select(`
            id,
            tracking_number,
            destination,
            amount_to_collect,
            currency,
            delivered_at,
            customer_id,
            customers!customer_id (
              name,
              phone
            )
          `)
          .eq('trip_id', tripId)
          .eq('status', 'delivered')
          .not('delivered_at', 'is', null);

        if (packagesError) {
          console.error('❌ Error fetching delivered packages:', packagesError);
          throw packagesError;
        }

        // Fetch payments for these packages
        const packageIds = (packages || []).map(pkg => pkg.id);
        
        let payments: any[] = [];
        if (packageIds.length > 0) {
          const { data: paymentsData, error: paymentsError } = await supabase
            .from('customer_payments')
            .select('*')
            .in('package_id', packageIds);

          if (paymentsError) {
            console.error('❌ Error fetching payments:', paymentsError);
            throw paymentsError;
          }
          
          payments = paymentsData || [];
        }

        // Group payments by package
        const paymentsByPackage = payments.reduce((acc, payment) => {
          if (!acc[payment.package_id]) {
            acc[payment.package_id] = [];
          }
          acc[payment.package_id].push(payment);
          return acc;
        }, {} as Record<string, any[]>);

        return {
          deliveredPackages: packages || [],
          paymentsByPackage
        };
      } catch (error) {
        console.error('❌ Error in usePackagePaymentsByTrip:', error);
        return { deliveredPackages: [], paymentsByPackage: {} };
      }
    },
    enabled: !!tripId,
    refetchInterval: 30000,
  });
}
