
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useDebtData() {
  return useQuery({
    queryKey: ['debt-data'],
    queryFn: async () => {
      // Fetch package debts with customer and package information
      const { data: debts, error: debtsError } = await supabase
        .from('package_debts')
        .select(`
          *,
          packages (
            tracking_number,
            destination,
            origin,
            trip_id,
            customers (
              name,
              phone,
              email
            ),
            trips (
              traveler_id,
              travelers (
                first_name,
                last_name
              )
            )
          )
        `)
        .order('debt_start_date', { ascending: false });

      if (debtsError) throw debtsError;

      // Fetch payment statistics by traveler
      const { data: travelerStats, error: statsError } = await supabase
        .from('packages')
        .select(`
          trip_id,
          amount_to_collect,
          freight,
          status,
          trips (
            traveler_id,
            travelers (
              first_name,
              last_name
            )
          )
        `)
        .not('trip_id', 'is', null);

      if (statsError) throw statsError;

      // Process traveler statistics
      const travelerSummary = travelerStats.reduce((acc, pkg) => {
        const travelerId = pkg.trips?.traveler_id;
        if (!travelerId) return acc;

        const travelerName = `${pkg.trips.travelers?.first_name} ${pkg.trips.travelers?.last_name}`;
        
        if (!acc[travelerId]) {
          acc[travelerId] = {
            id: travelerId,
            name: travelerName,
            totalPackages: 0,
            totalAmountToCollect: 0,
            totalFreight: 0,
            deliveredPackages: 0,
            pendingPackages: 0,
            revenue: 0
          };
        }

        acc[travelerId].totalPackages += 1;
        acc[travelerId].totalAmountToCollect += Number(pkg.amount_to_collect || 0);
        acc[travelerId].totalFreight += Number(pkg.freight || 0);
        
        if (pkg.status === 'delivered') {
          acc[travelerId].deliveredPackages += 1;
          acc[travelerId].revenue += Number(pkg.freight || 0);
        } else {
          acc[travelerId].pendingPackages += 1;
        }

        return acc;
      }, {} as Record<string, any>);

      return {
        debts: debts || [],
        travelerStats: Object.values(travelerSummary)
      };
    }
  });
}
