
import type { PaymentEntryData, PaymentMethod, ValidPayment } from '@/types/payment';

export const createDefaultPayment = (defaultMethod?: PaymentMethod): PaymentEntryData => ({
  methodId: 'efectivo', // Default to "efectivo"
  amount: '',
  currency: 'AWG',
  type: 'partial'
});

export const filterAvailablePaymentMethods = (paymentMethods: PaymentMethod[]) => {
  return paymentMethods.filter(method => 
    method.currency === 'AWG' || method.currency === 'COP'
  );
};

export const getCurrencySymbol = (currency: string, availablePaymentMethods?: PaymentMethod[]) => {
  // Fixed currency symbols for delivery form
  const symbols = {
    'AWG': 'ƒ',
    'USD': '$',
    'COP': '$'
  };
  return symbols[currency as keyof typeof symbols] || '$';
};

export const getValidPayments = (payments: PaymentEntryData[]): ValidPayment[] => {
  return payments
    .filter(p => p.methodId && p.amount && parseFloat(p.amount) > 0)
    .map(p => ({
      method_id: p.methodId,
      amount: parseFloat(p.amount),
      currency: p.currency,
      type: p.type
    }));
};

export const updatePaymentEntry = (
  payment: PaymentEntryData,
  field: keyof PaymentEntryData,
  value: string,
  availablePaymentMethods: PaymentMethod[],
  packageAmount?: number
): PaymentEntryData => {
  console.log('🔧 [updatePaymentEntry] ENTRY POINT');
  console.log('🔧 [updatePaymentEntry] Input payment:', payment);
  console.log('🔧 [updatePaymentEntry] Field to update:', field);
  console.log('🔧 [updatePaymentEntry] New value:', value);
  console.log('🔧 [updatePaymentEntry] Value type:', typeof value);
  
  // Crear el objeto actualizado SIN modificaciones adicionales primero
  const updatedPayment = { ...payment, [field]: value };
  console.log('🔧 [updatePaymentEntry] Payment after basic update:', updatedPayment);
  
  // Solo hacer validaciones adicionales si estamos actualizando el amount
  if (field === 'amount') {
    console.log('🔧 [updatePaymentEntry] Processing amount field');
    console.log('🔧 [updatePaymentEntry] Package amount:', packageAmount);
    
    // NO hacer parseFloat aquí, mantener el valor como string
    if (packageAmount !== undefined && value !== '') {
      const numericAmount = parseFloat(value);
      console.log('🔧 [updatePaymentEntry] Numeric amount for type calculation:', numericAmount);
      
      if (!isNaN(numericAmount)) {
        updatedPayment.type = numericAmount >= packageAmount ? 'full' : 'partial';
        console.log('🔧 [updatePaymentEntry] Updated type to:', updatedPayment.type);
      }
    }
  }
  
  // Ensure we always have a valid methodId
  if (!updatedPayment.methodId) {
    updatedPayment.methodId = 'efectivo';
    console.log('🔧 [updatePaymentEntry] Set default methodId to efectivo');
  }
  
  console.log('🔧 [updatePaymentEntry] FINAL RESULT:', updatedPayment);
  return updatedPayment;
};
