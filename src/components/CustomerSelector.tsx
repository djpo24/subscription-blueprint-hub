
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Plus } from 'lucide-react';
import { InlineCustomerForm } from './InlineCustomerForm';

interface CustomerSelectorProps {
  selectedCustomerId: string;
  onCustomerChange: (customerId: string) => void;
}

export function CustomerSelector({ selectedCustomerId, onCustomerChange }: CustomerSelectorProps) {
  const [showCustomerForm, setShowCustomerForm] = useState(false);

  // Fetch customers for the dropdown
  const { data: customers = [], refetch: refetchCustomers } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('id, name, email')
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });

  const handleCustomerCreated = (customerId: string) => {
    onCustomerChange(customerId);
    setShowCustomerForm(false);
    refetchCustomers();
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="customer">Cliente</Label>
        <div className="flex gap-2">
          <Select 
            value={selectedCustomerId} 
            onValueChange={onCustomerChange}
            required
          >
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Seleccionar cliente" />
            </SelectTrigger>
            <SelectContent>
              {customers.map((customer) => (
                <SelectItem key={customer.id} value={customer.id}>
                  {customer.name} - {customer.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowCustomerForm(true)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {showCustomerForm && (
        <InlineCustomerForm
          onSuccess={handleCustomerCreated}
          onCancel={() => setShowCustomerForm(false)}
        />
      )}
    </div>
  );
}
