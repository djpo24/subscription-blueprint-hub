
import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Plus } from 'lucide-react';
import { CustomerFormDialog } from './CustomerFormDialog';
import { CustomerSearchInput } from './CustomerSearchInput';
import { isValidEmail } from '@/utils/customerSearchUtils';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  id_number?: string;
}

interface CustomerSearchSelectorProps {
  selectedCustomerId: string;
  onCustomerChange: (customerId: string) => void;
  readOnly?: boolean;
}

export function CustomerSearchSelector({ selectedCustomerId, onCustomerChange, readOnly = false }: CustomerSearchSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [showCustomerDialog, setShowCustomerDialog] = useState(false);

  // Fetch customers for search (only when not readOnly)
  const { data: customers = [], refetch: refetchCustomers } = useQuery({
    queryKey: ['customers-search'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('id, name, email, phone, id_number')
        .order('name');
      
      if (error) throw error;
      return data as Customer[];
    },
    enabled: !readOnly
  });

  // Fetch specific customer when we have a selectedCustomerId (always enabled when we have an ID)
  const { data: selectedCustomer, isLoading: customerLoading } = useQuery({
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
    enabled: !!selectedCustomerId // Always enabled when we have an ID
  });

  // Update search term when customer is found
  useEffect(() => {
    if (selectedCustomer && readOnly) {
      console.log('Actualizando searchTerm (readOnly):', selectedCustomer.name);
      setSearchTerm(selectedCustomer.name);
    } else if (selectedCustomer && !readOnly && searchTerm !== selectedCustomer.name) {
      console.log('Actualizando searchTerm (editable):', selectedCustomer.name);
      setSearchTerm(selectedCustomer.name);
    }
  }, [selectedCustomer, readOnly]);

  // Reset search term when selectedCustomerId is cleared (but not in readOnly mode)
  useEffect(() => {
    if (!selectedCustomerId && !readOnly) {
      setSearchTerm('');
      setShowResults(false);
    }
  }, [selectedCustomerId, readOnly]);

  // Filter customers based on search term
  const filteredCustomers = useMemo(() => {
    if (!searchTerm.trim() || readOnly) return [];
    
    const term = searchTerm.toLowerCase();
    return customers.filter(customer => 
      customer.name.toLowerCase().includes(term) ||
      customer.phone.includes(term) ||
      (isValidEmail(customer.email) && customer.email.toLowerCase().includes(term)) ||
      (customer.id_number && customer.id_number.includes(term))
    );
  }, [customers, searchTerm, readOnly]);

  // Handle customer selection
  const handleCustomerSelect = (customer: Customer) => {
    if (readOnly) return;
    
    onCustomerChange(customer.id);
    setSearchTerm(customer.name);
    setShowResults(false);
  };

  // Handle search input change
  const handleSearchChange = (value: string) => {
    if (readOnly) return;
    
    setSearchTerm(value);
    setShowResults(value.trim().length > 0);
    
    // Clear selection if search term doesn't match selected customer
    if (selectedCustomer && !selectedCustomer.name.toLowerCase().includes(value.toLowerCase())) {
      onCustomerChange('');
    }
  };

  // Handle customer creation
  const handleCustomerCreated = (customerId: string) => {
    if (readOnly) return;
    
    onCustomerChange(customerId);
    refetchCustomers();
    // Update search term with new customer name
    const newCustomer = customers.find(c => c.id === customerId);
    if (newCustomer) {
      setSearchTerm(newCustomer.name);
    }
  };

  const handleFocus = () => {
    if (!readOnly && searchTerm.trim()) {
      setShowResults(true);
    }
  };

  const handleBlur = () => {
    if (!readOnly) {
      // Delay hiding results to allow clicks
      setTimeout(() => setShowResults(false), 200);
    }
  };

  // Display read-only version
  if (readOnly) {
    if (customerLoading) {
      return (
        <div>
          <Label htmlFor="customer">Cliente</Label>
          <div className="h-10 w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-sm text-gray-600 cursor-not-allowed">
            Cargando cliente...
          </div>
        </div>
      );
    }

    if (selectedCustomer) {
      return (
        <div>
          <Label htmlFor="customer">Cliente</Label>
          <div className="h-10 w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-sm text-gray-600 cursor-not-allowed">
            {selectedCustomer.name}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {selectedCustomer.email} • {selectedCustomer.phone}
          </div>
        </div>
      );
    } else if (selectedCustomerId) {
      // We have an ID but couldn't find the customer
      return (
        <div>
          <Label htmlFor="customer">Cliente</Label>
          <div className="h-10 w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-sm text-gray-600 cursor-not-allowed">
            Cliente no encontrado
          </div>
        </div>
      );
    } else {
      return (
        <div>
          <Label htmlFor="customer">Cliente</Label>
          <div className="h-10 w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-sm text-gray-600 cursor-not-allowed">
            Sin cliente asignado
          </div>
        </div>
      );
    }
  }

  return (
    <>
      <div className="relative">
        <Label htmlFor="customer-search">Cliente</Label>
        <div className="flex gap-2 mt-1">
          <CustomerSearchInput
            searchTerm={searchTerm}
            filteredCustomers={filteredCustomers}
            showResults={showResults}
            onSearchChange={handleSearchChange}
            onCustomerSelect={handleCustomerSelect}
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
          
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowCustomerDialog(true)}
            className="px-3"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Selected customer validation */}
        {searchTerm && !selectedCustomerId && (
          <div className="text-xs text-red-600 mt-1">
            Debe seleccionar un cliente de la lista
          </div>
        )}
      </div>

      <CustomerFormDialog
        open={showCustomerDialog}
        onOpenChange={setShowCustomerDialog}
        onSuccess={handleCustomerCreated}
      />
    </>
  );
}
