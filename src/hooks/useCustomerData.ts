import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Customer } from '@/types/supabase-temp';

interface CustomerDataResult {
  data: Customer[];
  isLoading: boolean;
  error: any;
}

interface SingleCustomerResult {
  customer: Customer | null;
  isLoading: boolean;
  getPhoneNumber: () => string | null;
}

export function useCustomerData(): CustomerDataResult;
export function useCustomerData(customerId: string): SingleCustomerResult;
export function useCustomerData(customerId?: string) {
  const { data: customers = [], isLoading, error } = useQuery({
    queryKey: customerId ? ['customer-data', customerId] : ['customer-data'],
    queryFn: async (): Promise<Customer[]> => {
      console.log('🔍 Fetching customer data...');
      
      try {
        let query = supabase.from('customers').select('*');
        
        if (customerId) {
          query = query.eq('id', customerId);
        } else {
          query = query.order('name');
        }

        const { data, error } = await query;

        if (error) {
          console.error('❌ Error fetching customer data:', error);
          throw error;
        }

        return data || [];
      } catch (error) {
        console.error('❌ Error in useCustomerData:', error);
        return [];
      }
    },
    refetchInterval: 30000,
  });

  // If customerId is provided, return single customer result
  if (customerId) {
    const customer = customers.find(c => c.id === customerId) || null;
    
    return {
      customer,
      isLoading,
      getPhoneNumber: () => {
        if (!customer) return null;
        return customer.whatsapp_number || customer.phone || null;
      }
    };
  }

  // Otherwise return all customers
  return {
    data: customers,
    isLoading,
    error
  };
}
