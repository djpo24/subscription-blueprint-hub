
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface CustomerPendingCollection {
  id: string;
  customer_name: string;
  phone: string;
  email: string;
  total_packages: number;
  total_pending_amount: number;
  last_delivery_date: string;
  package_numbers: string;
  package_statuses?: string;
}

export function useCustomersPendingCollection() {
  return useQuery({
    queryKey: ['customers-pending-collection'],
    queryFn: async () => {
      console.log('Fetching customers with pending collections...');
      
      // Use the database function to get collection packages data
      const { data, error } = await supabase.rpc('get_collection_packages');
      
      if (error) {
        console.error('Error fetching customers pending collection:', error);
        throw error;
      }
      
      console.log('Customers pending collection data:', data);
      
      // Transform the data to match the expected interface
      const customersMap = new Map<string, CustomerPendingCollection>();
      
      data?.forEach((pkg: any) => {
        const customerId = pkg.package_id;
        if (!customersMap.has(customerId)) {
          customersMap.set(customerId, {
            id: customerId,
            customer_name: pkg.customer_name || 'N/A',
            phone: pkg.customer_phone || '',
            email: '', // Not available in this function
            total_packages: 0,
            total_pending_amount: 0,
            last_delivery_date: pkg.delivery_date || pkg.created_at,
            package_numbers: '',
            package_statuses: ''
          });
        }
        
        const customer = customersMap.get(customerId)!;
        customer.total_packages += 1;
        customer.total_pending_amount += pkg.pending_amount || 0;
        customer.package_numbers += (customer.package_numbers ? ', ' : '') + pkg.tracking_number;
        customer.package_statuses += (customer.package_statuses ? ', ' : '') + pkg.package_status;
      });
      
      return Array.from(customersMap.values());
    },
  });
}
