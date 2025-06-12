
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Package, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCustomersPendingCollection } from '@/hooks/useCustomersPendingCollection';
import { formatCurrency } from '@/utils/currencyFormatter';
import { CustomersPendingTableRow } from './CustomersPendingTableRow';
import { DeliverPackageDialog } from '@/components/dispatch-details/DeliverPackageDialog';
import type { PackageInDispatch } from '@/types/dispatch';

export function SimpleCustomersPendingTable() {
  const { data: customers, isLoading, error, refetch } = useCustomersPendingCollection();
  const [selectedPackage, setSelectedPackage] = useState<PackageInDispatch | null>(null);
  const [deliveryDialogOpen, setDeliveryDialogOpen] = useState(false);

  const handleRetry = () => {
    console.log('🔄 Reintentando cargar clientes con cobros pendientes...');
    refetch();
  };

  const handleDeliverPackage = (customer: any) => {
    console.log('📦 [SimpleCustomersPendingTable] Abriendo dialog de entrega para cliente:', customer);
    
    // Convertir el cliente del formato de pending collection al formato de dispatch
    const packageForDelivery: PackageInDispatch = {
      id: customer.package_id,
      tracking_number: customer.tracking_number,
      origin: 'N/A', // No tenemos esta información en el contexto de pagos pendientes
      destination: customer.destination,
      status: 'delivered', // Ya está entregado, pero permitimos reentrega
      description: 'Paquete entregado - Gestión de pagos',
      weight: null,
      freight: 0,
      amount_to_collect: customer.pending_amount,
      currency: customer.currency,
      trip_id: null,
      delivered_at: customer.delivery_date,
      delivered_by: null,
      customers: {
        name: customer.customer_name,
        email: '',
        phone: customer.customer_phone
      }
    };
    
    setSelectedPackage(packageForDelivery);
    setDeliveryDialogOpen(true);
  };

  const handleDeliveryComplete = () => {
    console.log('✅ [SimpleCustomersPendingTable] Entrega completada, cerrando dialog...');
    setDeliveryDialogOpen(false);
    setSelectedPackage(null);
    // Refrescar la lista después de la entrega
    refetch();
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Pagos Pendientes
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
            <Package className="h-5 w-5" />
            Pagos Pendientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 font-medium mb-2">Error al cargar pagos pendientes</p>
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
              <Package className="h-5 w-5" />
              Pagos Pendientes
              {customers && customers.length > 0 && (
                <Badge variant="secondary" className="ml-2 bg-red-100 text-red-800">
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
          <p className="text-sm text-muted-foreground">
            Clientes con paquetes entregados pendientes de cobro
          </p>
        </CardHeader>
        <CardContent>
          {!customers || customers.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">¡Excelente!</p>
              <p className="text-gray-500">No hay pagos pendientes</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Paquete</TableHead>
                    <TableHead>Destino</TableHead>
                    <TableHead>Fecha de Entrega</TableHead>
                    <TableHead>Días Transcurridos</TableHead>
                    <TableHead className="text-right">Monto Pendiente</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.map((customer, index) => (
                    <CustomersPendingTableRow
                      key={`${customer.package_id}-${customer.customer_name}-${index}`}
                      customer={customer}
                      index={index}
                      onRecordPayment={() => {}} // Empty function since we're removing the button
                      onDeliver={handleDeliverPackage}
                    />
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de entrega - usando el mismo componente que la entrega móvil */}
      <DeliverPackageDialog
        open={deliveryDialogOpen}
        onOpenChange={setDeliveryDialogOpen}
        package={selectedPackage}
      />
    </>
  );
}
