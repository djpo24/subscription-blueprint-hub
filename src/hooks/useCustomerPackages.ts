
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { formatPackageDescription } from '@/utils/descriptionFormatter';
import type { RecordPaymentCustomer } from '@/types/recordPayment';

export function useCustomerPackages(customer: RecordPaymentCustomer | null, isOpen: boolean) {
  const [customerPackages, setCustomerPackages] = useState<any[]>([]);

  // Fetch customer packages when dialog opens
  useEffect(() => {
    if (isOpen && customer) {
      fetchCustomerPackages();
    }
  }, [isOpen, customer]);

  const fetchCustomerPackages = async () => {
    if (!customer) return;

    try {
      console.log('🔍 Fetching packages for customer:', customer.id);
      const { data: packages, error } = await supabase
        .from('packages')
        .select('*')
        .eq('customer_id', customer.id)
        .eq('status', 'delivered')
        .gt('amount_to_collect', 0);

      if (error) throw error;
      
      console.log('📦 Fetched packages:', packages);
      setCustomerPackages(packages || []);
    } catch (error) {
      console.error('Error fetching customer packages:', error);
    }
  };

  // Create a package object based on real customer data
  const mockPackage = customer && customerPackages.length > 0 ? {
    id: 'payment-mock',
    tracking_number: customer.package_numbers,
    destination: customerPackages[0].destination,
    description: customerPackages.length === 1 
      ? customerPackages[0].description 
      : formatPackageDescription(customerPackages.map(p => p.description).join(', ')),
    amount_to_collect: customer.total_pending_amount,
    currency: customerPackages[0].currency || 'COP',
    customers: {
      name: customer.customer_name
    }
  } : null;

  return {
    customerPackages,
    mockPackage
  };
}
