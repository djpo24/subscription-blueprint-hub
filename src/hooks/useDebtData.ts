
import { useQuery } from '@tanstack/react-query';
import { fetchPackageDebts, fetchDeliveredPackagesWithoutDebts, fetchCollectionStats } from '@/services/debtDataService';
import { 
  processRegisteredDebts, 
  processUnregisteredDebts, 
  processTravelerStats, 
  buildDebtDataResult 
} from '@/services/debtProcessingService';

export function useDebtData() {
  return useQuery({
    queryKey: ['debt-data'],
    queryFn: async () => {
      console.log('🔍 Fetching debt data - using refactored approach...');
      
      try {
        // Fetch package debts and delivered packages concurrently
        const [packageDebts, deliveredPackages] = await Promise.all([
          fetchPackageDebts(),
          fetchDeliveredPackagesWithoutDebts()
        ]);

        console.log('📦 Raw package debts:', packageDebts?.length || 0);
        console.log('📦 Raw delivered packages:', deliveredPackages?.length || 0);

        // Process registered debts
        const registeredDebts = processRegisteredDebts(packageDebts);
        console.log('✅ Processed registered debts:', registeredDebts.length);

        // Check for delivered packages without debt records
        const registeredPackageIds = new Set(packageDebts?.map(d => d.package_id) || []);
        const unregisteredDebts = processUnregisteredDebts(deliveredPackages, registeredPackageIds);
        console.log('⚠️ Processed unregistered debts:', unregisteredDebts.length);

        // Combine all debts
        const allDebts = [...registeredDebts, ...unregisteredDebts];
        console.log('📊 Total combined debts:', allDebts.length);

        // Fetch collection statistics
        const stats = await fetchCollectionStats();
        console.log('📈 Collection stats fetched:', !!stats);

        // Process traveler statistics
        const travelerStats = processTravelerStats(allDebts);
        console.log('👥 Traveler stats processed:', travelerStats.length);

        // Build final result
        const result = buildDebtDataResult(allDebts, travelerStats, stats);

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
