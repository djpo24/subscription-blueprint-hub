
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function usePackagePaymentsByTrip(tripId: string) {
  return useQuery({
    queryKey: ['package-payments-by-trip', tripId],
    queryFn: async () => {
      console.log('🔍 Fetching package payments for trip:', tripId);
      
      // Obtener todos los paquetes del viaje
      const { data: packages, error: packagesError } = await supabase
        .from('packages')
        .select('id, amount_to_collect, currency')
        .eq('trip_id', tripId);

      if (packagesError) {
        console.error('❌ Error fetching packages:', packagesError);
        throw packagesError;
      }

      if (!packages || packages.length === 0) {
        return { collected: {}, pending: {} };
      }

      const packageIds = packages.map(pkg => pkg.id);

      // Obtener pagos desde delivery_payments (a través de package_deliveries)
      const { data: packageDeliveries, error: deliveriesError } = await supabase
        .from('package_deliveries')
        .select(`
          package_id,
          delivery_payments (
            amount,
            currency
          )
        `)
        .in('package_id', packageIds);

      if (deliveriesError) {
        console.error('❌ Error fetching package deliveries:', deliveriesError);
        throw deliveriesError;
      }

      // Obtener pagos adicionales desde package_payments
      const { data: packagePayments, error: packagePaymentsError } = await supabase
        .from('package_payments')
        .select('amount, package_id')
        .in('package_id', packageIds);

      if (packagePaymentsError) {
        console.error('❌ Error fetching package payments:', packagePaymentsError);
        throw packagePaymentsError;
      }

      // Calcular montos cobrados por moneda
      const collectedByCurrency: Record<string, number> = {};

      // Sumar pagos de delivery_payments
      (packageDeliveries || []).forEach(delivery => {
        if (delivery.delivery_payments && Array.isArray(delivery.delivery_payments)) {
          delivery.delivery_payments.forEach(payment => {
            const currency = payment.currency || 'COP';
            if (!collectedByCurrency[currency]) {
              collectedByCurrency[currency] = 0;
            }
            collectedByCurrency[currency] += payment.amount;
          });
        }
      });

      // Sumar pagos de package_payments (asumiendo que están en la misma moneda del paquete)
      (packagePayments || []).forEach(payment => {
        const packageData = packages.find(pkg => pkg.id === payment.package_id);
        const currency = packageData?.currency || 'COP';
        if (!collectedByCurrency[currency]) {
          collectedByCurrency[currency] = 0;
        }
        collectedByCurrency[currency] += payment.amount;
      });

      // Calcular montos pendientes por moneda
      const pendingByCurrency: Record<string, number> = {};
      
      packages.forEach(pkg => {
        if (pkg.amount_to_collect && pkg.amount_to_collect > 0) {
          const currency = pkg.currency || 'COP';
          if (!pendingByCurrency[currency]) {
            pendingByCurrency[currency] = 0;
          }
          
          // Obtener cuánto se ha pagado de este paquete específico
          let totalPaidForThisPackage = 0;
          
          // Pagos desde delivery_payments
          const deliveryForPackage = packageDeliveries?.find(d => d.package_id === pkg.id);
          if (deliveryForPackage?.delivery_payments && Array.isArray(deliveryForPackage.delivery_payments)) {
            totalPaidForThisPackage += deliveryForPackage.delivery_payments.reduce((sum, payment) => sum + payment.amount, 0);
          }
          
          // Pagos desde package_payments
          const packagePaymentsForPackage = (packagePayments || [])
            .filter(payment => payment.package_id === pkg.id);
          totalPaidForThisPackage += packagePaymentsForPackage.reduce((sum, payment) => sum + payment.amount, 0);
          
          const pending = Math.max(0, pkg.amount_to_collect - totalPaidForThisPackage);
          pendingByCurrency[currency] += pending;
        }
      });

      console.log('✅ Package payments calculated:', {
        collected: collectedByCurrency,
        pending: pendingByCurrency,
        packageDeliveries: packageDeliveries?.length || 0,
        packagePayments: packagePayments?.length || 0
      });

      return {
        collected: collectedByCurrency,
        pending: pendingByCurrency
      };
    },
    enabled: !!tripId,
    refetchOnWindowFocus: false,
    staleTime: 30000 // Los datos se consideran obsoletos después de 30 segundos
  });
}
