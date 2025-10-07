import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useTripPackageStats() {
  return useQuery({
    queryKey: ['trip-package-stats'],
    queryFn: async () => {
      // Obtener todos los paquetes que tienen trip_id
      const { data: packages, error } = await supabase
        .from('packages')
        .select('trip_id, weight, freight, amount_to_collect, currency')
        .not('trip_id', 'is', null);

      if (error) {
        console.error('❌ Error fetching trip package stats:', error);
        throw error;
      }

      console.log('📊 [useTripPackageStats] Total packages fetched:', packages?.length || 0);

      // Agrupar estadísticas por trip_id
      const statsByTrip = (packages || []).reduce((acc, pkg) => {
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

      console.log('📊 [useTripPackageStats] Stats by trip calculated:', Object.keys(statsByTrip).length, 'trips');

      return statsByTrip;
    },
    staleTime: 1000 * 60 * 5, // Cache por 5 minutos
    refetchOnWindowFocus: true,
  });
}
