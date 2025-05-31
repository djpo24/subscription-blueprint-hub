import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Search, User } from 'lucide-react';
import { CustomerFormDialog } from './CustomerFormDialog';
import { formatNumber } from '@/utils/numberFormatter';
import { formatPhoneNumber } from '@/utils/phoneFormatter';

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
}

// Helper function to check if email is valid (not empty and not temporary)
const isValidEmail = (email: string): boolean => {
  if (!email || email.trim() === '') return false;
  
  // List of common temporary email domains
  const tempEmailDomains = [
    'tempmail.org',
    '10minutemail.com',
    'guerrillamail.com',
    'mailinator.com',
    'temp-mail.org',
    'throwaway.email',
    'maildrop.cc',
    'yopmail.com',
    'exemplo.com',
    'test.com',
    'temp.com',
    'temporal.com'
  ];
  
  const emailDomain = email.split('@')[1]?.toLowerCase();
  return emailDomain && !tempEmailDomains.includes(emailDomain);
};

// Helper function to format phone for display
const formatPhoneForDisplay = (phone: string): string => {
  // Extract country code and number
  if (phone.startsWith('+57')) {
    return formatPhoneNumber(phone.substring(3), '+57');
  } else if (phone.startsWith('+599')) {
    return formatPhoneNumber(phone.substring(4), '+599');
  }
  return phone;
};

export function CustomerSearchSelector({ selectedCustomerId, onCustomerChange }: CustomerSearchSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [showCustomerDialog, setShowCustomerDialog] = useState(false);

  // Reset search term when selectedCustomerId is cleared
  useEffect(() => {
    if (!selectedCustomerId) {
      setSearchTerm('');
      setShowResults(false);
    }
  }, [selectedCustomerId]);

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

  // Get selected customer info
  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);

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

  // Update search term when customer is selected externally
  useEffect(() => {
    if (selectedCustomer && searchTerm !== selectedCustomer.name) {
      setSearchTerm(selectedCustomer.name);
    }
  }, [selectedCustomer, searchTerm]);

  return (
    <>
      <div className="relative">
        <Label htmlFor="customer-search">Cliente</Label>
        <div className="flex gap-2 mt-1">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="customer-search"
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Buscar por nombre, cédula, teléfono o email..."
              className="pl-10"
              onFocus={() => searchTerm.trim() && setShowResults(true)}
              onBlur={() => {
                // Delay hiding results to allow clicks
                setTimeout(() => setShowResults(false), 200);
              }}
              required
            />
            
            {/* Search Results Dropdown */}
            {showResults && filteredCustomers.length > 0 && (
              <div className="absolute top-full left-0 right-0 z-50 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto mt-1">
                {filteredCustomers.map((customer) => (
                  <div
                    key={customer.id}
                    className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                    onClick={() => handleCustomerSelect(customer)}
                  >
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <div className="flex-1">
                        <div className="font-medium text-sm">{customer.name}</div>
                        <div className="text-xs text-gray-500 space-y-1">
                          {isValidEmail(customer.email) && (
                            <div>📧 {customer.email}</div>
                          )}
                          <div>📱 {formatPhoneForDisplay(customer.phone)}</div>
                          {customer.id_number && (
                            <div>🆔 {formatNumber(customer.id_number)}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* No results message */}
            {showResults && searchTerm.trim() && filteredCustomers.length === 0 && (
              <div className="absolute top-full left-0 right-0 z-50 bg-white border border-gray-200 rounded-md shadow-lg mt-1">
                <div className="p-3 text-center text-gray-500 text-sm">
                  No se encontraron clientes que coincidan con "{searchTerm}"
                </div>
              </div>
            )}
          </div>
          
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
