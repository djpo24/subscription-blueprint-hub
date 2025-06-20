
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ChatDialog } from '@/components/chat/ChatDialog';
import { EditCustomerDialog } from './EditCustomerDialog';
import { DeleteCustomerDialog } from './DeleteCustomerDialog';
import { CustomerSearchBar } from './CustomerSearchBar';
import { CustomersTable } from './CustomersTable';
import { CustomerFormDialog } from '@/components/CustomerFormDialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useCurrentUserRole } from '@/hooks/useCurrentUserRole';

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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [createCustomerDialogOpen, setCreateCustomerDialogOpen] = useState(false);
  const { toast } = useToast();
  const { data: userRole } = useCurrentUserRole();

  // Check if user can delete customers (admin or traveler only)
  const canDeleteCustomers = userRole?.role === 'admin' || userRole?.role === 'traveler';

  const { data: customers = [], isLoading, error, refetch } = useQuery({
    queryKey: ['customers-list'],
    queryFn: async () => {
      console.log('🔍 Obteniendo lista de clientes...');
      
      try {
        // Intentar obtener clientes sin RLS primero para debug
        const { data: customersData, error: customersError } = await supabase
          .from('customers')
          .select('*')
          .order('name');

        if (customersError) {
          console.error('❌ Error obteniendo clientes:', customersError);
          throw customersError;
        }

        console.log('✅ Clientes obtenidos:', customersData?.length || 0);

        if (!customersData || customersData.length === 0) {
          console.log('⚠️ No se encontraron clientes en la base de datos');
          return [];
        }

        // Get package counts for each customer
        const customerIds = customersData.map(c => c.id);
        
        if (customerIds.length > 0) {
          const { data: packageCounts, error: packageError } = await supabase
            .from('packages')
            .select('customer_id')
            .in('customer_id', customerIds);

          if (packageError) {
            console.error('❌ Error obteniendo conteo de paquetes:', packageError);
            // No lanzar error, solo usar 0 como conteo
          }

          // Count packages per customer
          const packageCountMap = (packageCounts || []).reduce((acc, pkg) => {
            acc[pkg.customer_id] = (acc[pkg.customer_id] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);

          return customersData.map(customer => ({
            ...customer,
            package_count: packageCountMap[customer.id] || 0
          }));
        }

        return customersData.map(customer => ({
          ...customer,
          package_count: 0
        }));

      } catch (error) {
        console.error('❌ Error crítico obteniendo clientes:', error);
        throw error;
      }
    },
    retry: 2,
    staleTime: 30000, // 30 segundos
  });

  // Always show all customers - remove search filtering that might be hiding customers
  const filteredCustomers = customers;

  console.log('📊 Estado de clientes:', {
    total: customers.length,
    isLoading,
    hasError: !!error,
    filtered: filteredCustomers.length
  });

  const handleChatClick = (customerId: string) => {
    setSelectedCustomerId(customerId);
    setChatDialogOpen(true);
  };

  const handleEditClick = (customerId: string) => {
    setSelectedCustomerId(customerId);
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (customerId: string) => {
    // Additional permission check
    if (!canDeleteCustomers) {
      toast({
        title: "Acceso denegado",
        description: "No tienes permisos para eliminar clientes",
        variant: "destructive",
      });
      return;
    }
    
    setSelectedCustomerId(customerId);
    setDeleteDialogOpen(true);
  };

  const handleEditSuccess = () => {
    refetch();
    setEditDialogOpen(false);
    toast({
      title: "Cliente actualizado",
      description: "La información del cliente ha sido actualizada exitosamente",
    });
  };

  const handleDeleteSuccess = () => {
    refetch();
    setDeleteDialogOpen(false);
    setSelectedCustomerId(null);
  };

  const handleCreateCustomerSuccess = (customerId: string) => {
    refetch();
    setCreateCustomerDialogOpen(false);
    toast({
      title: "Cliente creado",
      description: "El nuevo cliente ha sido creado exitosamente",
    });
  };

  const handleCustomerSearch = (customerId: string) => {
    setSearchCustomerId(customerId);
  };

  const handleClearSearch = () => {
    setSearchCustomerId(null);
  };

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);

  // Show error state
  if (error) {
    console.error('❌ Error en CustomersList:', error);
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="text-red-600 text-center">
          <h3 className="text-lg font-semibold mb-2">Error al cargar clientes</h3>
          <p className="text-sm mb-4">No se pudieron cargar los clientes desde la base de datos.</p>
          <div className="text-xs bg-red-50 p-3 rounded border border-red-200">
            <strong>Error técnico:</strong> {error.message || 'Error desconocido'}
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => refetch()} variant="outline">
            Reintentar
          </Button>
          <Button 
            onClick={() => setCreateCustomerDialogOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Crear Primer Cliente
          </Button>
        </div>
      </div>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-gray-500">Cargando clientes...</div>
      </div>
    );
  }

  // Show empty state if no customers
  if (customers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">No hay clientes registrados</h3>
          <p className="text-gray-600 mb-4">Crea tu primer cliente para comenzar.</p>
        </div>
        <Button 
          onClick={() => setCreateCustomerDialogOpen(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Crear Primer Cliente
        </Button>
        
        <CustomerFormDialog
          open={createCustomerDialogOpen}
          onOpenChange={setCreateCustomerDialogOpen}
          onSuccess={handleCreateCustomerSuccess}
        />
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <CustomerSearchBar 
          onCustomerSelect={handleCustomerSearch}
          onClearSearch={handleClearSearch}
        />
        
        <Button 
          onClick={() => setCreateCustomerDialogOpen(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Nuevo Cliente
        </Button>
      </div>

      <CustomersTable
        customers={customers}
        filteredCustomers={filteredCustomers}
        searchCustomerId={searchCustomerId}
        onChatClick={handleChatClick}
        onEditClick={handleEditClick}
        onDeleteClick={handleDeleteClick}
        canDelete={canDeleteCustomers}
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

          {canDeleteCustomers && (
            <DeleteCustomerDialog
              open={deleteDialogOpen}
              onOpenChange={setDeleteDialogOpen}
              customer={selectedCustomer}
              onSuccess={handleDeleteSuccess}
            />
          )}
        </>
      )}

      <CustomerFormDialog
        open={createCustomerDialogOpen}
        onOpenChange={setCreateCustomerDialogOpen}
        onSuccess={handleCreateCustomerSuccess}
      />
    </>
  );
}
