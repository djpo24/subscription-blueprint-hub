
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useDebtData() {
  return useQuery({
    queryKey: ['debt-data'],
    queryFn: async () => {
      console.log('🔍 Fetching debt data - using simplified approach...');
      
      // First, get all package debts with their related package and customer info
      const { data: packageDebts, error: debtsError } = await supabase
        .from('package_debts')
        .select(`
          *,
          packages!inner (
            id,
            tracking_number,
            customer_id,
            destination,
            freight,
            amount_to_collect,
            status,
            trip_id,
            delivered_at,
            currency,
            customers!inner (
              name,
              phone
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
        .neq('status', 'paid');

      if (debtsError) {
        console.error('❌ Error fetching package debts:', debtsError);
        throw debtsError;
      }

      console.log('💰 Package debts found:', packageDebts);

      // Also get delivered packages without debt records that have amount_to_collect > 0
      const { data: deliveredPackages, error: packagesError } = await supabase
        .from('packages')
        .select(`
          *,
          customers!inner (
            name,
            phone
          ),
          trips (
            traveler_id,
            travelers (
              first_name,
              last_name
            )
          )
        `)
        .eq('status', 'delivered')
        .gt('amount_to_collect', 0);

      if (packagesError) {
        console.error('❌ Error fetching delivered packages:', packagesError);
        throw packagesError;
      }

      console.log('📦 Delivered packages with amount_to_collect > 0:', deliveredPackages);

      // Process the data
      const processedDebts = [];

      // Add registered debts
      if (packageDebts) {
        for (const debt of packageDebts) {
          const pkg = debt.packages;
          const travelerName = pkg.trips?.travelers 
            ? `${pkg.trips.travelers.first_name} ${pkg.trips.travelers.last_name}`
            : 'Sin asignar';

          const debtDays = debt.debt_start_date 
            ? Math.max(0, Math.floor((new Date().getTime() - new Date(debt.debt_start_date).getTime()) / (1000 * 60 * 60 * 24)))
            : 0;

          processedDebts.push({
            package_id: pkg.id,
            tracking_number: pkg.tracking_number,
            customer_name: pkg.customers.name,
            customer_phone: pkg.customers.phone,
            destination: pkg.destination,
            traveler_name: travelerName,
            amount_to_collect: pkg.amount_to_collect,
            pending_amount: debt.pending_amount,
            paid_amount: debt.paid_amount,
            debt_status: debt.status,
            debt_type: debt.debt_type,
            debt_start_date: debt.debt_start_date,
            debt_days: debtDays,
            package_status: pkg.status,
            freight: pkg.freight,
            debt_id: debt.id,
            delivery_date: debt.delivery_date,
            created_at: debt.created_at,
            currency: debt.currency || pkg.currency || 'COP'
          });
        }
      }

      // Check for delivered packages without debt records
      if (deliveredPackages) {
        const registeredPackageIds = new Set(packageDebts?.map(d => d.package_id) || []);
        
        for (const pkg of deliveredPackages) {
          if (!registeredPackageIds.has(pkg.id)) {
            console.log(`⚠️ Found delivered package without debt record: ${pkg.tracking_number}`);
            
            const travelerName = pkg.trips?.travelers 
              ? `${pkg.trips.travelers.first_name} ${pkg.trips.travelers.last_name}`
              : 'Sin asignar';

            const deliveryDate = new Date(pkg.delivered_at);
            const debtDays = Math.max(0, Math.floor((new Date().getTime() - deliveryDate.getTime()) / (1000 * 60 * 60 * 24)));

            processedDebts.push({
              package_id: pkg.id,
              tracking_number: pkg.tracking_number,
              customer_name: pkg.customers.name,
              customer_phone: pkg.customers.phone,
              destination: pkg.destination,
              traveler_name: travelerName,
              amount_to_collect: pkg.amount_to_collect,
              pending_amount: pkg.amount_to_collect,
              paid_amount: 0,
              debt_status: 'pending',
              debt_type: 'unpaid',
              debt_start_date: pkg.delivered_at.split('T')[0],
              debt_days: debtDays,
              package_status: pkg.status,
              freight: pkg.freight,
              debt_id: null,
              delivery_date: pkg.delivered_at,
              created_at: pkg.created_at,
              currency: pkg.currency || 'COP'
            });
          }
        }
      }

      console.log('✅ Final processed debts:', processedDebts);
      console.log('📊 Total debts to display:', processedDebts.length);

      // Fetch collection statistics
      const { data: stats, error: statsError } = await supabase
        .from('collection_stats')
        .select('*')
        .single();

      if (statsError) {
        console.error('❌ Error fetching collection stats:', statsError);
      }

      // Process traveler statistics
      const travelerSummary = processedDebts.reduce((acc: Record<string, any>, debt: any) => {
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
        debts: processedDebts,
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

      console.log('🎯 Final result summary:', {
        totalDebts: result.debts.length,
        travelerStatsCount: result.travelerStats.length,
        hasCollectionStats: !!stats
      });
      
      return result;
    }
  });
}
