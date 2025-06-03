
import { useQuery } from '@tanstack/react-query';
import { fetchAllDebts, fetchCollectionStats } from '@/services/debtDataService';
import { 
  processDebtsFromDatabase, 
  processTravelerStats, 
  buildDebtDataResult 
} from '@/services/debtProcessingService';

export function useDebtData() {
  return useQuery({
    queryKey: ['debt-data'],
    queryFn: async () => {
      console.log('🔍 Fetching debt data using database function...');
      
      try {
        // Fetch debts using the database function that handles all logic correctly
        const [dbDebts, stats] = await Promise.all([
          fetchAllDebts(),
          fetchCollectionStats()
        ]);

        console.log('📦 Raw debts from database:', dbDebts?.length || 0);

        // Process the debts from database
        const processedDebts = processDebtsFromDatabase(dbDebts);
        console.log('✅ Processed debts from database:', processedDebts.length);

        // Log debt types for verification
        const unpaidDebts = processedDebts.filter(d => d.debt_type === 'unpaid');
        const uncollectedDebts = processedDebts.filter(d => d.debt_type === 'uncollected');
        console.log('📊 Debt type breakdown:', {
          unpaid: unpaidDebts.length,
          uncollected: uncollectedDebts.length,
          total: processedDebts.length
        });

        // Process traveler statistics
        const travelerStats = processTravelerStats(processedDebts);
        console.log('👥 Traveler stats processed:', travelerStats.length);

        // Build final result
        const result = buildDebtDataResult(processedDebts, travelerStats, stats);

        console.log('🎯 Final result summary:', {
          totalDebts: result.debts.length,
          travelerStatsCount: result.travelerStats.length,
          hasCollectionStats: !!result.collectionStats
        });
        
        return result;
      } catch (error) {
        console.error('❌ Error in useDebtData:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}
