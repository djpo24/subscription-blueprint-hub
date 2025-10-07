import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useTripPackageStats() {
  return useQuery({
    queryKey: ['trip-package-stats'],
    queryFn: async () => {
      console.log('📊 [useTripPackageStats] Iniciando consulta SIN LÍMITES...');
      
      // Obtener TODOS los paquetes sin límite usando el parámetro head
      const { data: packages, error, count } = await supabase
        .from('packages')
        .select('id, trip_id, weight, freight, amount_to_collect, currency', { count: 'exact', head: false })
        .not('trip_id', 'is', null);

      if (error) {
        console.error('❌ [useTripPackageStats] Error:', error);
        throw error;
      }

      console.log('📊 [useTripPackageStats] Paquetes obtenidos:', packages?.length || 0);
      console.log('📊 [useTripPackageStats] Count total en DB:', count);

      // Para el viaje del 1 de octubre
      const oct1TripId = '02eaef47-744b-43fe-a014-2c4ee19bef02';
      const oct1Packages = packages?.filter(p => p.trip_id === oct1TripId) || [];
      console.log('📊 [useTripPackageStats] Paquetes viaje Oct 1:', oct1Packages.length);
      console.log('📊 [useTripPackageStats] IDs del viaje Oct 1:', oct1Packages.map(p => p.id).slice(0, 5));

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

      console.log('📊 [useTripPackageStats] Stats finales para viaje Oct 1:', statsByTrip[oct1TripId]);
      console.log('📊 [useTripPackageStats] Total viajes con stats:', Object.keys(statsByTrip).length);

      return statsByTrip;
    },
    staleTime: 0, // No cache - forzar refresh
    gcTime: 0,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
}
