
import type { PaymentEntryData, PaymentMethod, ValidPayment } from '@/types/payment';

export const createDefaultPayment = (defaultMethod?: PaymentMethod): PaymentEntryData => ({
  methodId: defaultMethod?.id || '',
  amount: '',
  currency: 'COP', // Default a COP
  type: 'partial'
});

export const filterAvailablePaymentMethods = (paymentMethods: PaymentMethod[]) => {
  return paymentMethods.filter(method => 
    method.currency === 'ANG' || method.currency === 'COP'
  );
};

// Mapear AWG a ANG para compatibilidad con la base de datos
export const mapCurrencyForDB = (currency: string): string => {
  if (currency === 'AWG') return 'ANG';
  return currency;
};

// Mapear ANG a AWG para mostrar en la UI
export const mapCurrencyForUI = (currency: string): string => {
  if (currency === 'ANG') return 'AWG';
  return currency;
};

export const getCurrencySymbol = (currency: string, availablePaymentMethods: PaymentMethod[]) => {
  // Mapear AWG a ANG para buscar el método
  const searchCurrency = mapCurrencyForDB(currency);
  const method = availablePaymentMethods.find(m => m.currency === searchCurrency);
  return method?.symbol || '$';
};

export const getValidPayments = (payments: PaymentEntryData[]): ValidPayment[] => {
  return payments
    .filter(p => p.methodId && p.amount && parseFloat(p.amount) > 0)
    .map(p => ({
      method_id: p.methodId,
      amount: parseFloat(p.amount),
      currency: mapCurrencyForDB(p.currency), // Convertir AWG a ANG para la BD
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
    const searchCurrency = mapCurrencyForDB(value);
    const methodForCurrency = availablePaymentMethods.find(m => m.currency === searchCurrency);
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
