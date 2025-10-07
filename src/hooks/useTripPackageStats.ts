import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useTripPackageStats() {
  return useQuery({
    queryKey: ['trip-package-stats'],
    queryFn: async () => {
      console.log('📊 [useTripPackageStats] ===== START FETCHING =====');
      
      // Obtener TODOS los paquetes sin límite
      const { data: packages, error, count } = await supabase
        .from('packages')
        .select('id, trip_id, weight, freight, amount_to_collect, currency', { count: 'exact' })
        .range(0, 10000); // Aumentar límite significativamente

      if (error) {
        console.error('❌ [useTripPackageStats] Error:', error);
        throw error;
      }

      console.log('📊 [useTripPackageStats] Total packages in DB (count):', count);
      console.log('📊 [useTripPackageStats] Total packages fetched:', packages?.length || 0);

      // Filtrar solo los que tienen trip_id
      const packagesWithTrip = (packages || []).filter(pkg => pkg.trip_id);
      console.log('📊 [useTripPackageStats] Packages with trip_id:', packagesWithTrip.length);

      // ID del viaje del 1 de octubre para debugging
      const octoberTripId = '02eaef47-744b-43fe-a014-2c4ee19bef02';
      const octoberPackages = packagesWithTrip.filter(pkg => pkg.trip_id === octoberTripId);
      console.log('📊 [useTripPackageStats] Oct 1 trip packages found:', octoberPackages.length);

      // Agrupar estadísticas por trip_id
      const statsByTrip = packagesWithTrip.reduce((acc, pkg) => {
        if (!pkg.trip_id) return acc;

        if (!acc[pkg.trip_id]) {
          acc[pkg.trip_id] = {
            totalPackages: 0,
            totalWeight: 0,
            totalFreight: 0,
            amountsByCurrency: {} as Record<string, number>
          };
        }

        acc[pkg.trip_id].totalPackages += 1;
        acc[pkg.trip_id].totalWeight += (pkg.weight || 0);
        acc[pkg.trip_id].totalFreight += (pkg.freight || 0);

        const currency = pkg.currency || 'COP';
        const amount = pkg.amount_to_collect || 0;
        acc[pkg.trip_id].amountsByCurrency[currency] = 
          (acc[pkg.trip_id].amountsByCurrency[currency] || 0) + amount;

        return acc;
      }, {} as Record<string, {
        totalPackages: number;
        totalWeight: number;
        totalFreight: number;
        amountsByCurrency: Record<string, number>;
      }>);

      console.log('📊 [useTripPackageStats] Total trips with stats:', Object.keys(statsByTrip).length);
      
      // Log específico para el viaje del 1 de octubre
      if (statsByTrip[octoberTripId]) {
        console.log('📊 [useTripPackageStats] Oct 1 trip final stats:', {
          tripId: octoberTripId,
          ...statsByTrip[octoberTripId]
        });
      } else {
        console.error('❌ [useTripPackageStats] Oct 1 trip NOT FOUND in final stats!');
      }

      console.log('📊 [useTripPackageStats] ===== END FETCHING =====');

      return statsByTrip;
    },
    staleTime: 0, // No cache - siempre fetch fresh
    gcTime: 0, // No garbage collection cache
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
}
