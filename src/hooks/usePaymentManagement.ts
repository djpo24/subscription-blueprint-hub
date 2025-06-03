
import { useState } from 'react';
import { usePaymentMethods } from '@/hooks/usePaymentMethods';

interface PaymentEntryData {
  methodId: string;
  amount: string;
  currency: string;
  type: 'full' | 'partial';
}

export function usePaymentManagement() {
  const { data: paymentMethods = [] } = usePaymentMethods();
  
  // Filter payment methods for only Florín and Peso
  const availablePaymentMethods = paymentMethods.filter(method => 
    method.currency === 'AWG' || method.currency === 'COP'
  );

  // Initialize with default payment entry (Florín)
  const defaultMethod = availablePaymentMethods.find(m => m.currency === 'AWG');
  const [payments, setPayments] = useState<PaymentEntryData[]>([{
    methodId: defaultMethod?.id || '',
    amount: '',
    currency: 'AWG',
    type: 'partial'
  }]);

  const addPayment = () => {
    const defaultMethod = availablePaymentMethods.find(m => m.currency === 'AWG');
    setPayments(prev => [...prev, {
      methodId: defaultMethod?.id || '',
      amount: '',
      currency: 'AWG',
      type: 'partial'
    }]);
  };

  const removePayment = (index: number) => {
    if (payments.length > 1) {
      setPayments(prev => prev.filter((_, i) => i !== index));
    }
  };

  const updatePayment = (index: number, field: keyof PaymentEntryData, value: string, packageAmount?: number) => {
    setPayments(prev => prev.map((payment, i) => {
      if (i === index) {
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
      }
      return payment;
    }));
  };

  const resetPayments = () => {
    setPayments([{
      methodId: defaultMethod?.id || '',
      amount: '',
      currency: 'AWG',
      type: 'partial'
    }]);
  };

  const getCurrencySymbol = (currency: string) => {
    const method = availablePaymentMethods.find(m => m.currency === currency);
    return method?.symbol || '$';
  };

  const getValidPayments = () => {
    return payments
      .filter(p => p.methodId && p.amount && parseFloat(p.amount) > 0)
      .map(p => ({
        method_id: p.methodId,
        amount: parseFloat(p.amount),
        currency: p.currency,
        type: p.type
      }));
  };

  return {
    payments,
    addPayment,
    removePayment,
    updatePayment,
    resetPayments,
    getCurrencySymbol,
    getValidPayments,
    availablePaymentMethods
  };
}
