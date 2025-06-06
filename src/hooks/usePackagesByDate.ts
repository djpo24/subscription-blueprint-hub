
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

      // Obtener paquetes de estos viajes, excluyendo los ya despachados o entregados
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
          customers (
            name,
            email
          )
        `)
        .in('trip_id', tripIds)
        .not('status', 'in', '(procesado,delivered,in_transit)') // Excluir estados que no deben despacharse
        .order('created_at', { ascending: false });

      if (packagesError) {
        console.error('❌ Error fetching packages:', packagesError);
        throw packagesError;
      }

      // Obtener IDs de paquetes que ya están en algún despacho
      const { data: dispatchedPackages, error: dispatchError } = await supabase
        .from('dispatch_packages')
        .select('package_id')
        .in('package_id', (packages || []).map(p => p.id));

      if (dispatchError) {
        console.error('❌ Error fetching dispatched packages:', dispatchError);
      }

      const dispatchedPackageIds = new Set(
        (dispatchedPackages || []).map(dp => dp.package_id)
      );

      // Filtrar paquetes que ya están despachados
      const availablePackages = (packages || []).filter(
        pkg => !dispatchedPackageIds.has(pkg.id)
      );

      // Agrupar paquetes por viaje
      const tripsWithPackages = trips.map(trip => ({
        ...trip,
        packages: availablePackages.filter(pkg => pkg.trip_id === trip.id)
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
        totalPackages: availablePackages.length,
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
