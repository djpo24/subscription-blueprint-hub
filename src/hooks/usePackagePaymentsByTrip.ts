
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function usePackagePaymentsByTrip(tripId: string) {
  return useQuery({
    queryKey: ['package-payments-by-trip', tripId],
    queryFn: async () => {
      console.log('🔍 Fetching package payments for trip:', tripId);
      
      // Obtener todos los paquetes del viaje con sus datos de cobro
      const { data: packages, error: packagesError } = await supabase
        .from('packages')
        .select('id, amount_to_collect, currency')
        .eq('trip_id', tripId);

      if (packagesError) {
        console.error('❌ Error fetching packages:', packagesError);
        throw packagesError;
      }

      console.log('📦 Packages found:', packages?.length || 0, packages);

      if (!packages || packages.length === 0) {
        console.log('📭 No packages found for trip');
        return { collected: {}, pending: {} };
      }

      const packageIds = packages.map(pkg => pkg.id);
      console.log('🔍 Package IDs to search:', packageIds);

      // Obtener entregas de paquetes con sus pagos
      const { data: deliveries, error: deliveriesError } = await supabase
        .from('package_deliveries')
        .select(`
          package_id,
          total_amount_collected,
          delivery_payments (
            amount,
            currency
          )
        `)
        .in('package_id', packageIds);

      if (deliveriesError) {
        console.error('❌ Error fetching deliveries:', deliveriesError);
        throw deliveriesError;
      }

      console.log('🚚 Package deliveries found:', deliveries?.length || 0, deliveries);

      // Obtener pagos adicionales desde package_payments
      const { data: packagePayments, error: packagePaymentsError } = await supabase
        .from('package_payments')
        .select('amount, package_id')
        .in('package_id', packageIds);

      if (packagePaymentsError) {
        console.error('❌ Error fetching package payments:', packagePaymentsError);
        throw packagePaymentsError;
      }

      console.log('💰 Package payments found:', packagePayments?.length || 0, packagePayments);

      // Calcular montos cobrados por moneda
      const collectedByCurrency: Record<string, number> = {};
      const pendingByCurrency: Record<string, number> = {};

      // Procesar cada paquete
      packages.forEach(pkg => {
        const currency = pkg.currency || 'COP';
        const amountToCollect = pkg.amount_to_collect || 0;
        
        let totalPaidForPackage = 0;

        // Sumar pagos desde delivery_payments
        const delivery = deliveries?.find(d => d.package_id === pkg.id);
        if (delivery?.delivery_payments && Array.isArray(delivery.delivery_payments)) {
          delivery.delivery_payments.forEach(payment => {
            const amount = Number(payment.amount) || 0;
            totalPaidForPackage += amount;
            
            if (!collectedByCurrency[currency]) {
              collectedByCurrency[currency] = 0;
            }
            collectedByCurrency[currency] += amount;
            
            console.log(`💳 Delivery payment: ${amount} ${currency} for package ${pkg.id}`);
          });
        }

        // Sumar pagos desde package_payments
        const payments = packagePayments?.filter(p => p.package_id === pkg.id) || [];
        payments.forEach(payment => {
          const amount = Number(payment.amount) || 0;
          totalPaidForPackage += amount;
          
          if (!collectedByCurrency[currency]) {
            collectedByCurrency[currency] = 0;
          }
          collectedByCurrency[currency] += amount;
          
          console.log(`💰 Package payment: ${amount} ${currency} for package ${pkg.id}`);
        });

        // Calcular monto pendiente
        if (amountToCollect > 0) {
          const pending = Math.max(0, amountToCollect - totalPaidForPackage);
          
          if (!pendingByCurrency[currency]) {
            pendingByCurrency[currency] = 0;
          }
          pendingByCurrency[currency] += pending;
          
          console.log(`📊 Package ${pkg.id}: amount_to_collect=${amountToCollect}, paid=${totalPaidForPackage}, pending=${pending}`);
        }
      });

      console.log('✅ Package payments calculated:', {
        collected: collectedByCurrency,
        pending: pendingByCurrency,
        totalDeliveries: deliveries?.length || 0,
        totalPackagePayments: packagePayments?.length || 0
      });

      return {
        collected: collectedByCurrency,
        pending: pendingByCurrency
      };
    },
    enabled: !!tripId,
    refetchOnWindowFocus: false,
    staleTime: 30000
  });
}
