
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { RecordPaymentCustomer } from '@/types/recordPayment';

interface Package {
  id: string;
  tracking_number: string;
  customer_id: string;
  amount_to_collect: number;
  currency?: string;
  status: string;
  destination: string;
}

export function useCustomerPackages(customer: RecordPaymentCustomer | null, isOpen: boolean) {
  const { data: packages = [] } = useQuery({
    queryKey: ['customer-packages', customer?.id],
    queryFn: async (): Promise<Package[]> => {
      if (!customer?.id) return [];
      
      console.log('🔍 Fetching packages for customer:', customer.id);
      
      // Since customer.id is actually a package_id, we fetch that specific package
      const { data, error } = await supabase
        .from('packages')
        .select('*')
        .eq('id', customer.id)
        .single();

      if (error) {
        console.error('Error fetching package:', error);
        return [];
      }

      console.log('📦 Fetched package:', data);
      return data ? [data] : [];
    },
    enabled: !!customer?.id && isOpen,
  });

  // Create a mock package using the customer data for the payment dialog
  const mockPackage = customer ? {
    id: customer.id,
    tracking_number: customer.package_numbers,
    customer_id: customer.id, // This is actually the package_id
    amount_to_collect: customer.total_pending_amount,
    currency: packages[0]?.currency || 'COP', // Use the actual package currency if available
    status: 'delivered',
    destination: packages[0]?.destination || 'Unknown'
  } : null;

  return {
    customerPackages: packages,
    mockPackage
  };
}
