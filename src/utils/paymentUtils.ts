
import type { PaymentEntryData, PaymentMethod, ValidPayment } from '@/types/payment';

export const createDefaultPayment = (defaultMethod?: PaymentMethod): PaymentEntryData => ({
  methodId: defaultMethod?.id || '',
  amount: '',
  currency: 'AWG',
  type: 'partial'
});

export const filterAvailablePaymentMethods = (paymentMethods: PaymentMethod[]) => {
  return paymentMethods.filter(method => 
    method.currency === 'AWG' || method.currency === 'COP'
  );
};

export const getCurrencySymbol = (currency: string, availablePaymentMethods: PaymentMethod[]) => {
  const method = availablePaymentMethods.find(m => m.currency === currency);
  return method?.symbol || '$';
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
  
  // If currency is updated, find appropriate payment method
  if (field === 'currency') {
    const methodForCurrency = availablePaymentMethods.find(m => m.currency === value);
    if (methodForCurrency) {
      updatedPayment.methodId = methodForCurrency.id;
    }
  }
  
  // If amount is updated, recalculate type automatically
  if (field === 'amount' && packageAmount !== undefined) {
    const amount = parseFloat(value) || 0;
    updatedPayment.type = amount >= packageAmount ? 'full' : 'partial';
  }
  
  return updatedPayment;
};
