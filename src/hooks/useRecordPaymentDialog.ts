
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useCustomerPackages } from '@/hooks/useCustomerPackages';
import { usePaymentManagement } from '@/hooks/usePaymentManagement';
import { useCustomerData } from '@/hooks/useCustomerData';
import { PaymentSubmissionService } from '@/services/paymentSubmissionService';
import { toast } from '@/hooks/use-toast';
import type { RecordPaymentCustomer } from '@/types/recordPayment';
import type { PaymentEntryData } from '@/types/payment';

export function useRecordPaymentDialog(customer: RecordPaymentCustomer | null, isOpen: boolean) {
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  
  const { customerPackages, mockPackage } = useCustomerPackages(customer, isOpen);
  
  // Get customer data to ensure we have complete customer information
  const { customer: customerData } = useCustomerData(customer?.id || '');
  
  // Use the package currency if available, otherwise default to COP - MISMA LÓGICA
  const packageCurrency = customerPackages[0]?.currency || mockPackage?.currency || 'COP';
  
  // USAR LA MISMA LÓGICA DE GESTIÓN DE PAGOS QUE EN EL FORMULARIO MÓVIL
  const {
    payments,
    addPayment,
    updatePayment,
    removePayment,
    resetPayments,
    getCurrencySymbol,
    getValidPayments
  } = usePaymentManagement(packageCurrency);

  // Enhanced mock package with complete customer data - IDÉNTICO AL FORMULARIO MÓVIL
  const enhancedMockPackage = mockPackage && customerData ? {
    ...mockPackage,
    customers: {
      name: customerData.name,
      email: customerData.email || '',
      phone: customerData.phone || customerData.whatsapp_number || ''
    }
  } : mockPackage;

  console.log('🔧 [useRecordPaymentDialog] Customer data:', customerData);
  console.log('🔧 [useRecordPaymentDialog] Enhanced mock package:', enhancedMockPackage);

  // Reset form when dialog opens/closes or customer changes - MISMA LÓGICA
  useEffect(() => {
    if (isOpen && customer) {
      resetPayments();
      setNotes('');
    }
  }, [isOpen, customer?.id, resetPayments]);

  // IDÉNTICA lógica de actualización de pagos que en el formulario móvil
  const handlePaymentUpdate = (index: number, field: string, value: string) => {
    updatePayment(index, field as any, value, customer?.total_pending_amount || 0);
  };

  // IDÉNTICA lógica de envío que en el formulario móvil
  const handleSubmit = async (onSuccess: () => void, onClose: () => void) => {
    if (!customer || !user?.id) {
      console.error('❌ No customer or user available');
      return;
    }

    setIsLoading(true);
    
    try {
      const validPayments = getValidPayments();
      
      if (validPayments.length === 0) {
        toast({
          title: "Error",
          description: "Por favor ingresa al menos un pago válido",
          variant: "destructive"
        });
        return;
      }

      console.log('💳 Submitting payments with user ID:', user.id);
      
      // IDÉNTICA conversión que en el formulario móvil: ValidPayment[] to PaymentEntryData[]
      const paymentEntries: PaymentEntryData[] = validPayments.map(payment => ({
        methodId: payment.method_id,
        amount: payment.amount.toString(),
        currency: payment.currency,
        type: payment.type
      }));

      const result = await PaymentSubmissionService.submitPayment({
        customer,
        payments: paymentEntries,
        notes,
        currentUserId: user.id
      });

      toast({
        title: "¡Pago registrado!",
        description: `Se registró un pago de ${result.currency} ${result.totalPaid.toLocaleString('es-CO')} exitosamente.`,
      });

      onSuccess();
      onClose();
      
    } catch (error) {
      console.error('Error submitting payment:', error);
      toast({
        title: "Error al registrar pago",
        description: error instanceof Error ? error.message : "Error desconocido",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    notes,
    setNotes,
    isLoading,
    payments, // Ahora es PaymentEntryData[] como en el formulario móvil
    mockPackage: enhancedMockPackage,
    handlePaymentUpdate,
    addPayment,
    removePayment,
    getCurrencySymbol,
    handleSubmit
  };
}
