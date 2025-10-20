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
  payment: {
    amount: number;
    currency: string;
    payment_method: string;
  } | null;
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
          destination,
          customer_payments (
            amount,
            currency,
            payment_method
          )
        `)
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching customer history:', error);
        throw error;
      }

      if (!packages) return [];

      // Calculate points for each shipment (only for delivered and paid packages)
      const shipmentsWithPoints: CustomerShipment[] = packages
        .filter(pkg => {
          const isDelivered = pkg.status === 'delivered';
          const hasPay = pkg.customer_payments && pkg.customer_payments.length > 0;
          return isDelivered && hasPay;
        })
        .map(pkg => {
          const weight = pkg.weight || 0;
          const basePoints = 50; // 50 base points per shipment
          const weightPoints = weight > 1 ? (weight - 1) * 10 : 0; // 10 points per additional kilo (after 1st kilo)
          const totalPoints = basePoints + weightPoints;

          // Get payment information (first payment if multiple exist)
          const paymentData = pkg.customer_payments && pkg.customer_payments.length > 0 
            ? pkg.customer_payments[0] 
            : null;

          return {
            id: pkg.id,
            tracking_number: pkg.tracking_number,
            weight: pkg.weight,
            description: pkg.description,
            status: pkg.status,
            created_at: pkg.created_at,
            origin: pkg.origin,
            destination: pkg.destination,
            basePoints,
            weightPoints,
            totalPoints,
            payment: paymentData
          };
        });

      // Add packages that don't contribute to points (not delivered or not paid) with 0 points
      const nonScoringShipments: CustomerShipment[] = packages
        .filter(pkg => {
          const isDelivered = pkg.status === 'delivered';
          const hasPay = pkg.customer_payments && pkg.customer_payments.length > 0;
          return !(isDelivered && hasPay);
        })
        .map(pkg => {
          // Get payment information (first payment if multiple exist)
          const paymentData = pkg.customer_payments && pkg.customer_payments.length > 0 
            ? pkg.customer_payments[0] 
            : null;

          return {
            id: pkg.id,
            tracking_number: pkg.tracking_number,
            weight: pkg.weight,
            description: pkg.description,
            status: pkg.status,
            created_at: pkg.created_at,
            origin: pkg.origin,
            destination: pkg.destination,
            basePoints: 0,
            weightPoints: 0,
            totalPoints: 0,
            payment: paymentData
          };
        });

      // Combine both arrays and sort by date
      const allShipments = [...shipmentsWithPoints, ...nonScoringShipments]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      console.log('🏆 Customer history processed:', allShipments.length, 'shipments');
      return allShipments;
    },
    enabled: !!customerId,
  });
}