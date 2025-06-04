
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DollarSign, Users, Phone, AlertCircle, RefreshCw } from 'lucide-react';
import { useCustomersPendingCollection } from '@/hooks/useCustomersPendingCollection';
import { RecordPaymentDialog } from './RecordPaymentDialog';
import type { RecordPaymentCustomer } from '@/types/recordPayment';

export function SimpleCustomersPendingTable() {
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

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Clientes con Pagos Pendientes
            {customers && customers.length > 0 && (
              <span className="text-sm font-normal text-gray-500">
                ({customers.length})
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!customers || customers.length === 0 ? (
            <div className="text-center py-8">
              <DollarSign className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No hay clientes con pagos pendientes</p>
            </div>
          ) : (
            <div className="space-y-4">
              {customers.map((customer, index) => (
                <div
                  key={`${customer.package_id}-${customer.customer_name}-${index}`}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{customer.customer_name}</h4>
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {customer.tracking_number}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {customer.customer_phone}
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        ${customer.pending_amount?.toLocaleString('es-CO')} {customer.currency || 'COP'}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3 sm:mt-0">
                    <Button
                      size="sm"
                      onClick={() => handleRecordPayment(customer)}
                      className="w-full sm:w-auto"
                    >
                      <DollarSign className="h-4 w-4 mr-2" />
                      Registrar Pago
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <RecordPaymentDialog
        isOpen={isPaymentDialogOpen}
        onClose={handleClosePaymentDialog}
        customer={selectedCustomer}
        onPaymentRecorded={handlePaymentRecorded}
      />
    </>
  );
}
