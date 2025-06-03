
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
      console.log('🔍 Fetching debt data - using simplified approach...');
      
      // Fetch package debts and delivered packages concurrently
      const [packageDebts, deliveredPackages] = await Promise.all([
        fetchPackageDebts(),
        fetchDeliveredPackagesWithoutDebts()
      ]);

      // Process registered debts
      const registeredDebts = processRegisteredDebts(packageDebts);

      // Check for delivered packages without debt records
      const registeredPackageIds = new Set(packageDebts?.map(d => d.package_id) || []);
      const unregisteredDebts = processUnregisteredDebts(deliveredPackages, registeredPackageIds);

      // Combine all debts
      const allDebts = [...registeredDebts, ...unregisteredDebts];

      console.log('✅ Final processed debts:', allDebts);
      console.log('📊 Total debts to display:', allDebts.length);

      // Fetch collection statistics
      const stats = await fetchCollectionStats();

      // Process traveler statistics
      const travelerStats = processTravelerStats(allDebts);

      const result = buildDebtDataResult(allDebts, travelerStats, stats);

      console.log('🎯 Final result summary:', {
        totalDebts: result.debts.length,
        travelerStatsCount: result.travelerStats.length,
        hasCollectionStats: !!stats
      });
      
      return result;
    }
  });
}
