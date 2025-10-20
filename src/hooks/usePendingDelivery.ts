
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function usePendingDelivery() {
  return useQuery({
    queryKey: ['pending-delivery'],
    queryFn: async () => {
      console.log('🔍 Fetching pending delivery packages...');
      
      try {
        // Obtener paquetes que están en tránsito o en destino (pendientes de entrega)
        const { data, error } = await supabase
          .from('packages')
          .select(`
            id,
            tracking_number,
            origin,
            destination,
            status,
            description,
            weight,
            freight,
            amount_to_collect,
            currency,
            trip_id,
            created_at,
            customers!customer_id (
              name,
              phone
            ),
            trips!trip_id (
              departure_date,
              arrival_date
            )
          `)
          .in('status', ['en_transito', 'en_destino'])
          .order('created_at', { ascending: false })
          .limit(100);

        if (error) {
          console.error('❌ Error fetching pending delivery packages:', error);
          throw new Error(`Error en la base de datos: ${error.message}`);
        }

        console.log('📊 Raw pending delivery data:', data);

        if (!Array.isArray(data)) {
          console.warn('⚠️ Data is not an array, returning empty array');
          return [];
        }

        // Transformar los datos para el formato esperado
        const transformedData = data.map((pkg) => ({
          package_id: pkg.id,
          tracking_number: pkg.tracking_number,
          customer_name: pkg.customers?.name || 'N/A',
          customer_phone: pkg.customers?.phone || 'N/A',
          origin: pkg.origin || 'N/A',
          destination: pkg.destination || 'N/A',
          status: pkg.status,
          description: pkg.description || 'N/A',
          weight: pkg.weight,
          freight: pkg.freight || 0,
          amount_to_collect: pkg.amount_to_collect || 0,
          currency: pkg.currency || 'COP',
          trip_departure: pkg.trips?.departure_date || null,
          trip_arrival: pkg.trips?.arrival_date || null,
          created_at: pkg.created_at
        }));

        console.log('✅ Transformed pending delivery data:', transformedData);
        return transformedData;
      } catch (error) {
        console.error('❌ Error in usePendingDelivery:', error);
        throw error;
      }
    },
    refetchInterval: 30000, // Refrescar cada 30 segundos
    retry: 3,
    retryDelay: 1000,
  });
}
