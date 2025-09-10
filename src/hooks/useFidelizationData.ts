import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { startOfWeek, startOfMonth, isAfter, parseISO, isSameDay, addDays } from 'date-fns';

export interface FidelizationCustomer {
  id: string;
  name: string;
  totalShipments: number;
  bestStreak: number;
  totalPoints: number;
  position: number;
}

export type DateFilter = 'week' | 'month' | 'all';

interface Package {
  id: string;
  customer_id: string;
  weight: number | null;
  status: string | null;
  created_at: string;
  customers: {
    id: string;
    name: string;
  } | null;
  customer_payments: {
    id: string;
    amount: number;
  }[] | null;
}

export function useFidelizationData(dateFilter: DateFilter = 'all') {
  return useQuery({
    queryKey: ['fidelization-data', dateFilter],
    queryFn: async (): Promise<FidelizationCustomer[]> => {
      console.log('🏆 Fetching fidelization data...');

      // Get all packages with customer data and payments
      const { data: packages, error } = await supabase
        .from('packages')
        .select(`
          id,
          customer_id,
          weight,
          status,
          created_at,
          customers (
            id,
            name
          ),
          customer_payments (
            id,
            amount
          )
        `)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('❌ Error fetching packages for fidelization:', error);
        throw error;
      }

      if (!packages) return [];

      // Filter packages by date
      const now = new Date();
      let filterDate: Date;
      
      switch (dateFilter) {
        case 'week':
          filterDate = startOfWeek(now, { weekStartsOn: 1 }); // Monday start
          break;
        case 'month':
          filterDate = startOfMonth(now);
          break;
        default:
          filterDate = new Date(0); // All time
      }

      const filteredPackages = packages.filter(pkg => 
        isAfter(parseISO(pkg.created_at), filterDate)
      );

      // Group packages by customer
      const customerMap = new Map<string, {
        id: string;
        name: string;
        packages: Package[];
      }>();

      filteredPackages.forEach(pkg => {
        if (!pkg.customers || !pkg.customer_id) return;
        
        // Only count packages that are delivered AND have payments
        const isDelivered = pkg.status === 'delivered';
        const hasPay = pkg.customer_payments && pkg.customer_payments.length > 0;
        
        if (!isDelivered || !hasPay) return;
        
        if (!customerMap.has(pkg.customer_id)) {
          customerMap.set(pkg.customer_id, {
            id: pkg.customer_id,
            name: pkg.customers.name,
            packages: []
          });
        }
        customerMap.get(pkg.customer_id)!.packages.push(pkg as Package);
      });

      // Calculate metrics for each customer
      const fidelizationData: FidelizationCustomer[] = Array.from(customerMap.values()).map(customer => {
        const packages = customer.packages;
        
        // Total shipments
        const totalShipments = packages.length;
        
        // Calculate total points (50 per shipment + weight * 10)
        const totalPoints = packages.reduce((sum, pkg) => {
          const weight = pkg.weight || 0;
          return sum + 50 + (weight * 10); // 50 base points + 10 per kilo
        }, 0);

        // Calculate best streak
        const bestStreak = calculateBestStreak(packages);

        return {
          id: customer.id,
          name: customer.name,
          totalShipments,
          bestStreak,
          totalPoints: Math.round(totalPoints),
          position: 0 // Will be set after sorting
        };
      });

      // Sort by total points (descending) and assign positions
      const sortedData = fidelizationData
        .sort((a, b) => b.totalPoints - a.totalPoints)
        .map((customer, index) => ({
          ...customer,
          position: index + 1
        }));

      console.log('🏆 Fidelization data processed:', sortedData.length, 'customers');
      return sortedData;
    },
    refetchInterval: 30000,
  });
}

function calculateBestStreak(packages: Package[]): number {
  if (packages.length === 0) return 0;
  
  // Sort packages by date
  const sortedPackages = packages.sort((a, b) => 
    parseISO(a.created_at).getTime() - parseISO(b.created_at).getTime()
  );

  // Group packages by date (only consider the date, not time)
  const packagesByDate = new Map<string, Package[]>();
  sortedPackages.forEach(pkg => {
    const dateKey = parseISO(pkg.created_at).toDateString();
    if (!packagesByDate.has(dateKey)) {
      packagesByDate.set(dateKey, []);
    }
    packagesByDate.get(dateKey)!.push(pkg);
  });

  const uniqueDates = Array.from(packagesByDate.keys()).sort();
  if (uniqueDates.length === 0) return 0;

  let maxStreak = 1;
  let currentStreak = 1;

  for (let i = 1; i < uniqueDates.length; i++) {
    const currentDate = new Date(uniqueDates[i]);
    const previousDate = new Date(uniqueDates[i - 1]);
    
    // Check if dates are consecutive (current date is the day after previous date)
    const expectedDate = addDays(previousDate, 1);
    
    if (isSameDay(currentDate, expectedDate)) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      currentStreak = 1;
    }
  }

  return maxStreak;
}