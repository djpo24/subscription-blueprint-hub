
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
        console.log('📭 No packages found for trip:', tripId);
        return { collected: {}, pending: {} };
      }

      const packageIds = packages.map(pkg => pkg.id);
      console.log('📦 Package IDs for trip:', packageIds);

      // Obtener pagos realizados a través de delivery_payments
      const { data: deliveryPayments, error: deliveryPaymentsError } = await supabase
        .from('delivery_payments')
        .select(`
          amount,
          currency,
          delivery_id,
          package_deliveries!inner(
            package_id,
            delivery_status
          )
        `)
        .in('package_deliveries.package_id', packageIds);

      if (deliveryPaymentsError) {
        console.error('❌ Error fetching delivery payments:', deliveryPaymentsError);
        throw deliveryPaymentsError;
      }

      console.log('💰 Delivery payments found:', deliveryPayments);

      // Obtener pagos adicionales a través de package_payments
      const { data: packagePayments, error: packagePaymentsError } = await supabase
        .from('package_payments')
        .select('amount, package_id')
        .in('package_id', packageIds);

      if (packagePaymentsError) {
        console.error('❌ Error fetching package payments:', packagePaymentsError);
        throw packagePaymentsError;
      }

      console.log('💸 Package payments found:', packagePayments);

      // Calcular montos cobrados por moneda
      const collectedByCurrency: Record<string, number> = {};
      
      // Sumar pagos de delivery_payments
      (deliveryPayments || []).forEach(payment => {
        const currency = payment.currency || 'COP';
        if (!collectedByCurrency[currency]) {
          collectedByCurrency[currency] = 0;
        }
        collectedByCurrency[currency] += payment.amount;
      });

      // Sumar pagos de package_payments (asumiendo que son en la misma moneda del paquete)
      (packagePayments || []).forEach(payment => {
        const packageInfo = packages.find(pkg => pkg.id === payment.package_id);
        const currency = packageInfo?.currency || 'COP';
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
          
          // Calcular cuánto se ha pagado de este paquete específico
          const deliveryPaymentsForPackage = (deliveryPayments || [])
            .filter(payment => payment.package_deliveries?.package_id === pkg.id)
            .reduce((sum, payment) => sum + payment.amount, 0);
          
          const packagePaymentsForPackage = (packagePayments || [])
            .filter(payment => payment.package_id === pkg.id)
            .reduce((sum, payment) => sum + payment.amount, 0);
          
          const totalPaidForPackage = deliveryPaymentsForPackage + packagePaymentsForPackage;
          const pending = Math.max(0, pkg.amount_to_collect - totalPaidForPackage);
          
          if (!pendingByCurrency[currency]) {
            pendingByCurrency[currency] = 0;
          }
          pendingByCurrency[currency] += pending;
        }
      });

      console.log('✅ Package payments calculated:', {
        collected: collectedByCurrency,
        pending: pendingByCurrency,
        packages: packages.length,
        deliveryPayments: deliveryPayments?.length || 0,
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
