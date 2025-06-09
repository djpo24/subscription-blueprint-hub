
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ChatDialog } from '@/components/chat/ChatDialog';
import { EditCustomerDialog } from './EditCustomerDialog';
import { CustomerSearchBar } from './CustomerSearchBar';
import { CustomersTable } from './CustomersTable';
import { useToast } from '@/hooks/use-toast';

interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string | null;
  created_at: string;
  package_count: number;
}

export function CustomersList() {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [searchCustomerId, setSearchCustomerId] = useState<string | null>(null);
  const [chatDialogOpen, setChatDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: customers = [], isLoading, refetch } = useQuery({
    queryKey: ['customers-list'],
    queryFn: async () => {
      const { data: customersData, error: customersError } = await supabase
        .from('customers')
        .select('*')
        .order('name');

      if (customersError) throw customersError;

      // Get package counts for each customer
      const customerIds = customersData.map(c => c.id);
      const { data: packageCounts, error: packageError } = await supabase
        .from('packages')
        .select('customer_id')
        .in('customer_id', customerIds);

      if (packageError) throw packageError;

      // Count packages per customer
      const packageCountMap = packageCounts.reduce((acc, pkg) => {
        acc[pkg.customer_id] = (acc[pkg.customer_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return customersData.map(customer => ({
        ...customer,
        package_count: packageCountMap[customer.id] || 0
      }));
    },
  });

  // Filter customers based on search
  const filteredCustomers = searchCustomerId 
    ? customers.filter(customer => customer.id === searchCustomerId)
    : customers;

  const handleChatClick = (customerId: string) => {
    setSelectedCustomerId(customerId);
    setChatDialogOpen(true);
  };

  const handleEditClick = (customerId: string) => {
    setSelectedCustomerId(customerId);
    setEditDialogOpen(true);
  };

  const handleEditSuccess = () => {
    refetch();
    setEditDialogOpen(false);
    toast({
      title: "Cliente actualizado",
      description: "La información del cliente ha sido actualizada exitosamente",
    });
  };

  const handleCustomerSearch = (customerId: string) => {
    setSearchCustomerId(customerId);
  };

  const handleClearSearch = () => {
    setSearchCustomerId(null);
  };

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-gray-500">Cargando clientes...</div>
      </div>
    );
  }

  return (
    <>
      <CustomerSearchBar 
        onCustomerSelect={handleCustomerSearch}
        onClearSearch={handleClearSearch}
      />

      <CustomersTable
        customers={customers}
        filteredCustomers={filteredCustomers}
        searchCustomerId={searchCustomerId}
        onChatClick={handleChatClick}
        onEditClick={handleEditClick}
      />

      {selectedCustomer && (
        <>
          <ChatDialog
            open={chatDialogOpen}
            onOpenChange={setChatDialogOpen}
            customerId={selectedCustomerId}
            customerName={selectedCustomer.name}
            phone={selectedCustomer.phone}
          />
          
          <EditCustomerDialog
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            customer={selectedCustomer}
            onSuccess={handleEditSuccess}
          />
        </>
      )}
    </>
  );
}
