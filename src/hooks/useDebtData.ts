
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useDebtData() {
  return useQuery({
    queryKey: ['debt-data'],
    queryFn: async () => {
      console.log('🔍 Fetching debt data with improved detection...');
      
      // Fetch collection packages using the updated database function
      const { data: debts, error: debtsError } = await supabase.rpc('get_collection_packages', {
        p_limit: 1000,
        p_offset: 0
      });

      if (debtsError) {
        console.error('❌ Error fetching debts:', debtsError);
        throw debtsError;
      }

      console.log('📦 Raw debts data from database function:', debts);
      console.log('📊 Total records from database:', debts?.length || 0);

      // Enhanced logging for verification
      if (debts && debts.length > 0) {
        const statusCount = debts.reduce((acc: Record<string, number>, debt: any) => {
          const status = debt.debt_status || 'no_status';
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        }, {});
        console.log('📈 Debt status breakdown:', statusCount);

        const typeCount = debts.reduce((acc: Record<string, number>, debt: any) => {
          const type = debt.debt_type || 'no_type';
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        }, {});
        console.log('📋 Debt type breakdown:', typeCount);

        // Log delivered packages with debt (which should now be properly detected)
        const deliveredWithDebt = debts.filter((debt: any) => 
          debt.package_status === 'delivered' && debt.pending_amount > 0
        );
        console.log('✅ Delivered packages with outstanding debt:', deliveredWithDebt.length);
        
        if (deliveredWithDebt.length > 0) {
          console.log('   First few examples:');
          deliveredWithDebt.slice(0, 3).forEach((debt: any, index: number) => {
            console.log(`   ${index + 1}. ${debt.tracking_number}: pending=${debt.pending_amount} ${debt.currency}, type=${debt.debt_type}, status=${debt.debt_status}`);
          });
        }

        // Log packages that have pending collections but haven't been delivered
        const undeliveredWithDebt = debts.filter((debt: any) => 
          debt.package_status !== 'delivered' && debt.pending_amount > 0
        );
        console.log('📋 Undelivered packages with debt:', undeliveredWithDebt.length);
      }

      // Fetch collection statistics using the updated view
      const { data: stats, error: statsError } = await supabase
        .from('collection_stats')
        .select('*')
        .single();

      if (statsError) {
        console.error('❌ Error fetching collection stats:', statsError);
        // Use empty stats as fallback
        console.log('ℹ️ Using empty stats as fallback due to error');
      }

      console.log('📊 Collection stats from view:', stats);

      // Process traveler statistics with improved logic
      const travelerSummary = debts.reduce((acc: Record<string, any>, debt: any) => {
        const travelerId = debt.traveler_name || 'Sin asignar';
        
        if (!acc[travelerId]) {
          acc[travelerId] = {
            id: travelerId,
            name: debt.traveler_name || 'Sin asignar',
            totalPackages: 0,
            totalAmountToCollect: 0,
            totalFreight: 0,
            deliveredPackages: 0,
            pendingPackages: 0,
            revenue: 0,
            totalCollected: 0,
            pendingAmount: 0
          };
        }

        acc[travelerId].totalPackages += 1;
        acc[travelerId].totalAmountToCollect += Number(debt.amount_to_collect || 0);
        acc[travelerId].totalFreight += Number(debt.freight || 0);
        acc[travelerId].totalCollected += Number(debt.paid_amount || 0);
        acc[travelerId].pendingAmount += Number(debt.pending_amount || 0);
        
        if (debt.package_status === 'delivered') {
          acc[travelerId].deliveredPackages += 1;
          acc[travelerId].revenue += Number(debt.freight || 0);
        } else {
          acc[travelerId].pendingPackages += 1;
        }

        return acc;
      }, {});

      const result = {
        debts: debts || [],
        travelerStats: Object.values(travelerSummary),
        collectionStats: stats || {
          total_pending: 0,
          total_collected: 0,
          pending_payment: 0,
          overdue_30_days: 0,
          total_packages: 0,
          delivered_packages: 0
        }
      };

      console.log('✅ Final processed debt data:', {
        totalDebts: result.debts.length,
        travelerStatsCount: result.travelerStats.length,
        hasCollectionStats: !!stats
      });
      
      return result;
    }
  });
}
