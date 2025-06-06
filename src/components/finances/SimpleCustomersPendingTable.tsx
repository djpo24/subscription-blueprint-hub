
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useCustomersPendingCollection } from '@/hooks/useCustomersPendingCollection';
import { RecordPaymentDialog } from './RecordPaymentDialog';
import { CustomersPendingTableHeader } from './CustomersPendingTableHeader';
import { CustomersPendingTableRow } from './CustomersPendingTableRow';
import { CustomersPendingTableStates } from './CustomersPendingTableStates';
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

  // Show loading, error, or empty states
  if (isLoading || error || !customers || customers.length === 0) {
    return (
      <CustomersPendingTableStates
        isLoading={isLoading}
        error={error}
        isEmpty={!customers || customers.length === 0}
        onRetry={handleRetry}
      />
    );
  }

  const totalPendingAmount = customers.reduce((sum, customer) => sum + (customer.pending_amount || 0), 0);

  return (
    <>
      <Card>
        <CustomersPendingTableHeader
          customersCount={customers.length}
          totalPendingAmount={totalPendingAmount}
        />
        <CardContent>
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
                {customers.map((customer, index) => (
                  <CustomersPendingTableRow
                    key={`${customer.package_id}-${customer.customer_name}-${index}`}
                    customer={customer}
                    index={index}
                    onRecordPayment={handleRecordPayment}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
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
