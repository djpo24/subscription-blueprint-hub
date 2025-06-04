
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useCustomersPendingCollection() {
  return useQuery({
    queryKey: ['customers-pending-collection'],
    queryFn: async () => {
      console.log('🔍 Fetching customers with pending collections...');
      
      try {
        const { data, error } = await supabase
          .rpc('get_collection_packages', {
            p_limit: 50,
            p_offset: 0
          });

        if (error) {
          console.error('❌ Error fetching pending collections:', error);
          throw new Error(`Error en la base de datos: ${error.message}`);
        }

        console.log('📊 Fetched pending collections:', data);
        
        // Asegurar que data es un array
        if (!Array.isArray(data)) {
          console.warn('⚠️ Data is not an array, returning empty array');
          return [];
        }

        return data;
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
