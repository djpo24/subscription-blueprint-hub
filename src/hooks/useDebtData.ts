
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useDebtData() {
  return useQuery({
    queryKey: ['debt-data'],
    queryFn: async () => {
      console.log('🔍 Fetching debt data...');
      
      // Fetch collection packages using the updated database function
      const { data: debts, error: debtsError } = await supabase.rpc('get_collection_packages', {
        p_limit: 1000,
        p_offset: 0
      });

      if (debtsError) {
        console.error('❌ Error fetching debts:', debtsError);
        throw debtsError;
      }

      console.log('📦 Raw debts data:', debts);
      console.log('📊 Total records:', debts?.length || 0);

      // Log debt statuses - now with improved detection
      if (debts && debts.length > 0) {
        const statusCount = debts.reduce((acc: Record<string, number>, debt: any) => {
          const status = debt.debt_status || 'no_status';
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        }, {});
        console.log('📈 Debt status breakdown:', statusCount);

        // Log debt types
        const typeCount = debts.reduce((acc: Record<string, number>, debt: any) => {
          const type = debt.debt_type || 'no_type';
          acc[type] = (acc[type] || 0) + 1;
          return acc;
        }, {});
        console.log('📋 Debt type breakdown:', typeCount);

        // Log detailed debt records for debugging
        console.log('🔍 Detailed debt records:');
        debts.forEach((debt: any, index: number) => {
          if (index < 5) { // Log first 5 for debugging
            console.log(`  ${index + 1}. Package ${debt.package_id}:`, {
              tracking_number: debt.tracking_number,
              customer_name: debt.customer_name,
              amount_to_collect: debt.amount_to_collect,
              pending_amount: debt.pending_amount,
              debt_status: debt.debt_status,
              debt_type: debt.debt_type,
              package_status: debt.package_status,
              debt_days: debt.debt_days,
              debt_start_date: debt.debt_start_date
            });
          }
        });

        // Log packages that should now be detected as debtors
        const deliveredWithDebt = debts.filter((debt: any) => 
          debt.package_status === 'delivered' && debt.pending_amount > 0
        );
        console.log('✅ Delivered packages with debt detected:', deliveredWithDebt.length);
        if (deliveredWithDebt.length > 0) {
          console.log('   Examples:', deliveredWithDebt.slice(0, 3).map(d => ({
            tracking: d.tracking_number,
            pending: d.pending_amount,
            status: d.debt_status,
            type: d.debt_type
          })));
        }
      }

      // Fetch collection statistics using the updated view
      const { data: stats, error: statsError } = await supabase
        .from('collection_stats')
        .select('*')
        .single();

      if (statsError) {
        console.error('❌ Error fetching stats:', statsError);
        // Don't throw error for stats, use empty object as fallback
        console.log('ℹ️ Using empty stats as fallback');
      }

      console.log('📊 Collection stats:', stats);

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

      console.log('✅ Final processed data:', result);
      console.log('📈 Total debts in result:', result.debts.length);
      
      return result;
    }
  });
}
