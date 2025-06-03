
import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { isValidEmail } from '@/utils/customerSearchUtils';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  id_number?: string;
}

export function useCustomerSearch(selectedCustomerId: string, onCustomerChange: (customerId: string) => void) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showResults, setShowResults] = useState(false);

  // Fetch customers for search
  const { data: customers = [], refetch: refetchCustomers } = useQuery({
    queryKey: ['customers-search'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('id, name, email, phone, id_number')
        .order('name');
      
      if (error) throw error;
      return data as Customer[];
    }
  });

  // Fetch specific customer when we have a selectedCustomerId
  const { data: selectedCustomer } = useQuery({
    queryKey: ['customer-details', selectedCustomerId],
    queryFn: async () => {
      if (!selectedCustomerId) return null;
      
      console.log('Buscando detalles del cliente:', selectedCustomerId);
      const { data, error } = await supabase
        .from('customers')
        .select('id, name, email, phone, id_number')
        .eq('id', selectedCustomerId)
        .maybeSingle();
      
      if (error) {
        console.error('Error al buscar cliente:', error);
        throw error;
      }
      
      console.log('Cliente encontrado:', data);
      return data;
    },
    enabled: !!selectedCustomerId
  });

  // Update search term when customer is found
  useEffect(() => {
    if (selectedCustomer && searchTerm !== selectedCustomer.name) {
      console.log('Actualizando searchTerm (editable):', selectedCustomer.name);
      setSearchTerm(selectedCustomer.name);
    }
  }, [selectedCustomer]);

  // Reset search term when selectedCustomerId is cleared
  useEffect(() => {
    if (!selectedCustomerId) {
      setSearchTerm('');
      setShowResults(false);
    }
  }, [selectedCustomerId]);

  // Filter customers based on search term
  const filteredCustomers = useMemo(() => {
    if (!searchTerm.trim()) return [];
    
    const term = searchTerm.toLowerCase();
    return customers.filter(customer => 
      customer.name.toLowerCase().includes(term) ||
      customer.phone.includes(term) ||
      (isValidEmail(customer.email) && customer.email.toLowerCase().includes(term)) ||
      (customer.id_number && customer.id_number.includes(term))
    );
  }, [customers, searchTerm]);

  // Handle customer selection
  const handleCustomerSelect = (customer: Customer) => {
    onCustomerChange(customer.id);
    setSearchTerm(customer.name);
    setShowResults(false);
  };

  // Handle search input change
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setShowResults(value.trim().length > 0);
    
    // Clear selection if search term doesn't match selected customer
    if (selectedCustomer && !selectedCustomer.name.toLowerCase().includes(value.toLowerCase())) {
      onCustomerChange('');
    }
  };

  // Handle customer creation
  const handleCustomerCreated = (customerId: string) => {
    onCustomerChange(customerId);
    refetchCustomers();
    // Update search term with new customer name
    const newCustomer = customers.find(c => c.id === customerId);
    if (newCustomer) {
      setSearchTerm(newCustomer.name);
    }
  };

  const handleFocus = () => {
    if (searchTerm.trim()) {
      setShowResults(true);
    }
  };

  const handleBlur = () => {
    // Delay hiding results to allow clicks
    setTimeout(() => setShowResults(false), 200);
  };

  return {
    searchTerm,
    showResults,
    filteredCustomers,
    selectedCustomer,
    selectedCustomerId,
    handleCustomerSelect,
    handleSearchChange,
    handleCustomerCreated,
    handleFocus,
    handleBlur
  };
}
