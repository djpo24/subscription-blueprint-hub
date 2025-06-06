
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useCollectedOrders() {
  return useQuery({
    queryKey: ['collected-orders'],
    queryFn: async () => {
      console.log('🔍 Fetching collected orders...');
      
      try {
        // Obtener pagos de clientes con información de paquetes y clientes
        const { data, error } = await supabase
          .from('customer_payments')
          .select(`
            id,
            amount,
            payment_method,
            currency,
            payment_date,
            notes,
            created_by,
            package_id,
            packages (
              tracking_number,
              destination,
              delivered_at,
              customers (
                name,
                phone
              )
            )
          `)
          .order('payment_date', { ascending: false })
          .limit(100);

        if (error) {
          console.error('❌ Error fetching collected orders:', error);
          throw new Error(`Error en la base de datos: ${error.message}`);
        }

        console.log('📊 Raw collected orders data:', data);

        if (!Array.isArray(data)) {
          console.warn('⚠️ Data is not an array, returning empty array');
          return [];
        }

        // Transformar los datos para el formato esperado
        const transformedData = data
          .filter(payment => payment.packages) // Solo pagos con paquetes válidos
          .map(payment => ({
            payment_id: payment.id,
            amount: payment.amount,
            payment_method: payment.payment_method,
            currency: payment.currency || 'COP',
            payment_date: payment.payment_date,
            notes: payment.notes,
            created_by: payment.created_by,
            tracking_number: payment.packages.tracking_number,
            destination: payment.packages.destination,
            delivered_at: payment.packages.delivered_at,
            customer_name: payment.packages.customers?.name || 'N/A',
            customer_phone: payment.packages.customers?.phone || 'N/A'
          }));

        console.log('✅ Transformed collected orders data:', transformedData);
        return transformedData;
      } catch (error) {
        console.error('❌ Error in useCollectedOrders:', error);
        throw error;
      }
    },
    refetchInterval: 30000, // Refrescar cada 30 segundos
    retry: 3,
    retryDelay: 1000,
  });
}
