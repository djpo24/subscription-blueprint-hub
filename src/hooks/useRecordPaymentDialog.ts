
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { usePaymentEntries } from '@/hooks/usePaymentEntries';
import { useCustomerPackages } from '@/hooks/useCustomerPackages';
import { PaymentSubmissionService } from '@/services/paymentSubmissionService';
import type { RecordPaymentCustomer } from '@/types/recordPayment';

export function useRecordPaymentDialog(customer: RecordPaymentCustomer | null, isOpen: boolean) {
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Get customer packages and mock package
  const { customerPackages, mockPackage } = useCustomerPackages(customer, isOpen);

  // Get payment entries management
  const {
    payments,
    handlePaymentUpdate,
    addPayment,
    removePayment,
    getCurrencySymbol
  } = usePaymentEntries({
    isOpen,
    packageCurrency: mockPackage?.currency,
    customerTotalAmount: customer?.total_pending_amount
  });

  console.log('💰 Mock package currency:', mockPackage?.currency);

  const handleSubmit = async (onPaymentRecorded: () => void, onClose: () => void) => {
    if (!customer) return;

    setIsLoading(true);

    try {
      const result = await PaymentSubmissionService.submitPayment({
        customer,
        payments,
        notes
      });

      const currencySymbol = getCurrencySymbol(result.currency);
      
      toast({
        title: 'Pago registrado',
        description: `Se registró un pago total por ${currencySymbol}${result.totalPaid.toLocaleString('es-CO')} ${result.currency} para ${customer.customer_name}`,
      });

      onPaymentRecorded();
      onClose();
    } catch (error) {
      console.error('Error recording payment:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'No se pudo registrar el pago',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    notes,
    setNotes,
    isLoading,
    payments,
    mockPackage,
    handlePaymentUpdate,
    addPayment,
    removePayment,
    getCurrencySymbol,
    handleSubmit
  };
}
