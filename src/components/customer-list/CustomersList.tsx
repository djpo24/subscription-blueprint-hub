
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MessageCircle, Edit, Users, Package } from 'lucide-react';
import { PhoneWithFlag } from '@/components/PhoneWithFlag';
import { ChatDialog } from '@/components/chat/ChatDialog';
import { EditCustomerDialog } from './EditCustomerDialog';
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Lista de Clientes
          </CardTitle>
          <div className="text-sm text-muted-foreground">
            Total de clientes: {customers.length}
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre Completo</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Dirección</TableHead>
                  <TableHead className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Package className="h-4 w-4" />
                      Envíos
                    </div>
                  </TableHead>
                  <TableHead className="text-center">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="font-medium">
                      {customer.name}
                    </TableCell>
                    <TableCell>
                      <PhoneWithFlag phone={customer.phone} />
                    </TableCell>
                    <TableCell>{customer.email}</TableCell>
                    <TableCell>
                      {customer.address ? (
                        <span className="text-sm">{customer.address}</span>
                      ) : (
                        <span className="text-gray-400 text-sm">Sin dirección</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium">
                          {customer.package_count}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleChatClick(customer.id)}
                          className="h-8 w-8 p-0"
                        >
                          <MessageCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditClick(customer.id)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {customers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                      No hay clientes registrados
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

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
