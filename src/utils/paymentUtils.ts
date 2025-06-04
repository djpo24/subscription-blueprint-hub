
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
  const updatedPayment = { ...payment, [field]: value };
  
  // If amount is updated, recalculate type automatically
  if (field === 'amount' && packageAmount !== undefined) {
    const amount = parseFloat(value) || 0;
    updatedPayment.type = amount >= packageAmount ? 'full' : 'partial';
  }
  
  // Ensure we always have a valid methodId
  if (!updatedPayment.methodId) {
    updatedPayment.methodId = 'efectivo';
  }
  
  return updatedPayment;
};
