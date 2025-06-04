
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DollarSign, Users, Phone, AlertCircle, RefreshCw, Calendar, Package, MapPin } from 'lucide-react';
import { useCustomersPendingCollection } from '@/hooks/useCustomersPendingCollection';
import { RecordPaymentDialog } from './RecordPaymentDialog';
import { formatCurrency } from '@/utils/currencyFormatter';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { RecordPaymentCustomer } from '@/types/recordPayment';

export function SimpleCustomersPendingTable() {
  const { data: customers, isLoading, error, refetch } = useCustomersPendingCollection();
  const [selectedCustomer, setSelectedCustomer] = useState<RecordPaymentCustomer | null>(null);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);

  const handleRecordPayment = (customer: any) => {
    console.log('🎯 Registrar pago para:', customer.customer_name);
    console.log('📦 Datos del cliente/paquete:', customer);
    
    // Create the RecordPaymentCustomer using the package data
    const recordPaymentCustomer: RecordPaymentCustomer = {
      id: customer.package_id, // This will be used as the package ID in payment processing
      customer_name: customer.customer_name,
      phone: customer.customer_phone,
      total_pending_amount: customer.pending_amount,
      package_numbers: customer.tracking_number
    };
    
    console.log('💰 Datos para registro de pago:', recordPaymentCustomer);
    setSelectedCustomer(recordPaymentCustomer);
    setIsPaymentDialogOpen(true);
  };

  const handlePaymentRecorded = () => {
    console.log('✅ Pago registrado exitosamente');
    refetch(); // Refresh the data
  };

  const handleClosePaymentDialog = () => {
    setIsPaymentDialogOpen(false);
    setSelectedCustomer(null);
  };

  const handleRetry = () => {
    console.log('🔄 Reintentando cargar datos...');
    refetch();
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'dd MMM yyyy', { locale: es });
    } catch {
      return 'Fecha inválida';
    }
  };

  const getDaysSinceDelivery = (deliveryDate: string | null) => {
    if (!deliveryDate) return 0;
    try {
      const delivery = new Date(deliveryDate);
      const today = new Date();
      const diffTime = Math.abs(today.getTime() - delivery.getTime());
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    } catch {
      return 0;
    }
  };

  const getUrgencyBadgeColor = (days: number) => {
    if (days >= 30) return 'destructive';
    if (days >= 15) return 'secondary';
    return 'outline';
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Clientes con Pagos Pendientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-500">Cargando clientes con pagos pendientes...</p>
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
            <Users className="h-5 w-5" />
            Clientes con Pagos Pendientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 font-medium mb-2">Error al cargar datos de clientes</p>
            <p className="text-sm text-gray-600 mb-4">
              {error instanceof Error ? error.message : 'Error desconocido'}
            </p>
            <Button 
              onClick={handleRetry}
              variant="outline"
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Reintentar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalPendingAmount = customers?.reduce((sum, customer) => sum + (customer.pending_amount || 0), 0) || 0;

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Clientes con Pagos Pendientes
              {customers && customers.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {customers.length}
                </Badge>
              )}
            </CardTitle>
            {customers && customers.length > 0 && (
              <div className="text-sm text-gray-600">
                Total pendiente: <span className="font-medium text-red-600">
                  {formatCurrency(totalPendingAmount, 'COP')}
                </span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {!customers || customers.length === 0 ? (
            <div className="text-center py-8">
              <DollarSign className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No hay clientes con pagos pendientes</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Paquete</TableHead>
                    <TableHead>Destino</TableHead>
                    <TableHead>Fecha Entrega</TableHead>
                    <TableHead>Días</TableHead>
                    <TableHead className="text-right">Monto Pendiente</TableHead>
                    <TableHead className="text-center">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.map((customer, index) => {
                    const daysSinceDelivery = getDaysSinceDelivery(customer.delivery_date);
                    return (
                      <TableRow 
                        key={`${customer.package_id}-${customer.customer_name}-${index}`}
                        className="hover:bg-gray-50"
                      >
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">{customer.customer_name}</div>
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <Phone className="h-3 w-3" />
                              {customer.customer_phone}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Package className="h-3 w-3 text-gray-500" />
                            <span className="text-sm font-mono">
                              {customer.tracking_number}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-gray-500" />
                            <span className="text-sm">{customer.destination}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-gray-500" />
                            <span className="text-sm">
                              {formatDate(customer.delivery_date)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={getUrgencyBadgeColor(daysSinceDelivery)}
                            className="text-xs"
                          >
                            {daysSinceDelivery} días
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="font-medium text-red-600">
                            {formatCurrency(customer.pending_amount || 0, customer.currency as 'COP' | 'AWG' || 'COP')}
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
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedCustomer && (
        <RecordPaymentDialog
          isOpen={isPaymentDialogOpen}
          onClose={handleClosePaymentDialog}
          customer={selectedCustomer}
          onPaymentRecorded={handlePaymentRecorded}
        />
      )}
    </>
  );
}
