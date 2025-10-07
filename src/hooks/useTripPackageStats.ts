import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useTripPackageStats() {
  return useQuery({
    queryKey: ['trip-package-stats'],
    queryFn: async () => {
      // Obtener todos los paquetes que tienen trip_id asignado
      const { data: packages, error } = await supabase
        .from('packages')
        .select('id, trip_id, weight, freight, amount_to_collect, currency')
        .not('trip_id', 'is', null)
        .range(0, 999999);

      if (error) {
        console.error('Error fetching packages for stats:', error);
        throw error;
      }

      // Agrupar estadísticas por trip_id
      const statsByTrip = (packages || []).reduce((acc, pkg) => {
        const tripId = pkg.trip_id!;

        if (!acc[tripId]) {
          acc[tripId] = {
            totalPackages: 0,
            totalWeight: 0,
            totalFreight: 0,
            amountsByCurrency: {} as Record<string, number>
          };
        }

        acc[tripId].totalPackages += 1;
        acc[tripId].totalWeight += Number(pkg.weight || 0);
        acc[tripId].totalFreight += Number(pkg.freight || 0);

        const currency = pkg.currency || 'COP';
        const amount = Number(pkg.amount_to_collect || 0);
        acc[tripId].amountsByCurrency[currency] = 
          (acc[tripId].amountsByCurrency[currency] || 0) + amount;

        return acc;
      }, {} as Record<string, {
        totalPackages: number;
        totalWeight: number;
        totalFreight: number;
        amountsByCurrency: Record<string, number>;
      }>);

      return statsByTrip;
    },
    staleTime: 30000, // 30 segundos
  });
}
