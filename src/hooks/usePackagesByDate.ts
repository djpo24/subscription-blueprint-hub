
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { formatDateForQuery } from '@/utils/dateUtils';

export function usePackagesByDate(selectedDate: Date) {
  const formattedDate = formatDateForQuery(selectedDate);
  
  return useQuery({
    queryKey: ['packages-by-date', formattedDate],
    queryFn: async () => {
      console.log('🔍 Fetching packages for date:', formattedDate);
      
      // Obtener viajes para la fecha seleccionada
      const { data: trips, error: tripsError } = await supabase
        .from('trips')
        .select(`
          id,
          origin,
          destination,
          flight_number,
          status,
          traveler_id,
          travelers (
            first_name,
            last_name
          )
        `)
        .eq('trip_date', formattedDate)
        .order('created_at', { ascending: false });

      if (tripsError) {
        console.error('❌ Error fetching trips:', tripsError);
        throw tripsError;
      }

      if (!trips || trips.length === 0) {
        console.log('📭 No trips found for date:', formattedDate);
        return { trips: [], dispatches: [] };
      }

      const tripIds = trips.map(trip => trip.id);

      // Obtener TODAS las encomiendas de estos viajes (sin filtrar por estado)
      // pero excluyendo las eliminadas (deleted_at IS NULL)
      const { data: packages, error: packagesError } = await supabase
        .from('packages')
        .select(`
          id,
          tracking_number,
          customer_id,
          description,
          weight,
          freight,
          amount_to_collect,
          currency,
          status,
          trip_id,
          discount_applied,
          customers (
            name,
            email
          )
        `)
        .in('trip_id', tripIds)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (packagesError) {
        console.error('❌ Error fetching packages:', packagesError);
        throw packagesError;
      }

      // Agrupar paquetes por viaje (mostrando TODAS las encomiendas)
      const tripsWithPackages = trips.map(trip => ({
        ...trip,
        packages: (packages || []).filter(pkg => pkg.trip_id === trip.id)
      }));

      // Obtener despachos para la fecha
      const { data: dispatches, error: dispatchesError } = await supabase
        .from('dispatch_relations')
        .select('*')
        .eq('dispatch_date', formattedDate)
        .order('created_at', { ascending: false });

      if (dispatchesError) {
        console.error('❌ Error fetching dispatches:', dispatchesError);
      }

      console.log('✅ Packages by date loaded:', {
        trips: tripsWithPackages.length,
        totalPackages: (packages || []).length,
        dispatches: dispatches?.length || 0
      });

      return {
        trips: tripsWithPackages,
        dispatches: dispatches || []
      };
    },
    refetchOnWindowFocus: true,
    refetchInterval: 30000, // Refrescar cada 30 segundos
    staleTime: 10000 // Los datos se consideran obsoletos después de 10 segundos
  });
}
