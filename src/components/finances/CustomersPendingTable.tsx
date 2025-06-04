
import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Phone, Mail, Package, DollarSign } from 'lucide-react';
import { useCustomersPendingCollection } from '@/hooks/useCustomersPendingCollection';
import { RecordPaymentDialog } from './RecordPaymentDialog';
import type { RecordPaymentCustomer } from '@/types/recordPayment';

export function CustomersPendingTable() {
  const { data: customers, isLoading, error, refetch } = useCustomersPendingCollection();
  const [selectedCustomer, setSelectedCustomer] = useState<RecordPaymentCustomer | null>(null);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);

  const handleRecordPayment = (customer: any) => {
    console.log('🎯 Registrar pago para:', customer.customer_name);
    
    // Convert the customer format to RecordPaymentCustomer
    const recordPaymentCustomer: RecordPaymentCustomer = {
      id: customer.package_id, // Use package_id as the customer ID for payment processing
      customer_name: customer.customer_name,
      phone: customer.customer_phone,
      total_pending_amount: customer.pending_amount,
      package_numbers: customer.tracking_number
    };
    
    setSelectedCustomer(recordPaymentCustomer);
    setIsPaymentDialogOpen(true);
  };

  const handlePaymentRecorded = () => {
    refetch();
    setIsPaymentDialogOpen(false);
    setSelectedCustomer(null);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Clientes con Cobros Pendientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-500">Cargando datos...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Clientes con Cobros Pendientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-red-500">
            <p>Error al cargar los datos</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!customers || customers.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Clientes con Cobros Pendientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">¡Excelente!</p>
            <p>No hay clientes con cobros pendientes</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'default';
      case 'en_destino':
      case 'arrived':
        return 'secondary';
      case 'in_transit':
      case 'transito':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'delivered': 'Entregado',
      'en_destino': 'En Destino',
      'arrived': 'Llegó',
      'in_transit': 'En Tránsito',
      'transito': 'En Tránsito',
      'recibido': 'Recibido',
      'bodega': 'En Bodega',
      'procesado': 'Procesado'
    };
    return statusMap[status] || status;
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Clientes con Cobros Pendientes
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {customers?.length || 0} cliente{(customers?.length || 0) !== 1 ? 's' : ''} con paquetes entregados pendientes de cobro
          </p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Contacto</TableHead>
                  <TableHead>Estado del Paquete</TableHead>
                  <TableHead className="text-right">Monto Pendiente</TableHead>
                  <TableHead>Fecha de Entrega</TableHead>
                  <TableHead>Número de Seguimiento</TableHead>
                  <TableHead className="text-center">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers?.map((customer) => (
                  <TableRow key={customer.package_id}>
                    <TableCell>
                      <div className="font-medium">{customer.customer_name}</div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm">
                          <Phone className="h-3 w-3" />
                          {customer.customer_phone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={getStatusBadgeVariant(customer.package_status)}
                        className="text-xs"
                      >
                        {getStatusText(customer.package_status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="font-semibold text-orange-600">
                        {formatCurrency(customer.pending_amount)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {customer.delivery_date ? formatDistanceToNow(new Date(customer.delivery_date), {
                          addSuffix: true,
                          locale: es,
                        }) : 'N/A'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[200px]">
                        <span className="text-sm font-mono text-muted-foreground">
                          {customer.tracking_number}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        size="sm"
                        onClick={() => handleRecordPayment(customer)}
                        className="gap-1"
                      >
                        <DollarSign className="h-3 w-3" />
                        Registrar Pago
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <RecordPaymentDialog
        isOpen={isPaymentDialogOpen}
        onClose={() => {
          setIsPaymentDialogOpen(false);
          setSelectedCustomer(null);
        }}
        customer={selectedCustomer}
        onPaymentRecorded={handlePaymentRecorded}
      />
    </>
  );
}
