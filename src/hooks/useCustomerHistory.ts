import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface CustomerShipment {
  id: string;
  tracking_number: string | null;
  weight: number | null;
  description: string | null;
  status: string | null;
  created_at: string;
  origin: string | null;
  destination: string | null;
  basePoints: number;
  weightPoints: number;
  totalPoints: number;
}

export function useCustomerHistory(customerId: string | null) {
  return useQuery({
    queryKey: ['customer-history', customerId],
    queryFn: async (): Promise<CustomerShipment[]> => {
      if (!customerId) return [];

      console.log('🏆 Fetching customer history for:', customerId);

      const { data: packages, error } = await supabase
        .from('packages')
        .select(`
          id,
          tracking_number,
          weight,
          description,
          status,
          created_at,
          origin,
          destination
        `)
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching customer history:', error);
        throw error;
      }

      if (!packages) return [];

      // Calculate points for each shipment
      const shipmentsWithPoints: CustomerShipment[] = packages.map(pkg => {
        const weight = pkg.weight || 0;
        const basePoints = 50; // 50 points per shipment
        const weightPoints = weight * 10; // 10 points per kilo
        const totalPoints = basePoints + weightPoints;

        return {
          ...pkg,
          basePoints,
          weightPoints,
          totalPoints
        };
      });

      console.log('🏆 Customer history processed:', shipmentsWithPoints.length, 'shipments');
      return shipmentsWithPoints;
    },
    enabled: !!customerId,
  });
}