
import { useState } from 'react';
import { usePaymentMethods } from '@/hooks/usePaymentMethods';
import type { PaymentEntryData } from '@/types/payment';
import {
  createDefaultPayment,
  filterAvailablePaymentMethods,
  getCurrencySymbol,
  getValidPayments,
  updatePaymentEntry
} from '@/utils/paymentUtils';

export function usePaymentManagement() {
  const { data: paymentMethods = [] } = usePaymentMethods();
  
  // Filter payment methods for only Florín and Peso
  const availablePaymentMethods = filterAvailablePaymentMethods(paymentMethods);

  // Initialize with default payment entry (Florín)
  const defaultMethod = availablePaymentMethods.find(m => m.currency === 'AWG');
  const [payments, setPayments] = useState<PaymentEntryData[]>([
    createDefaultPayment(defaultMethod)
  ]);

  const addPayment = () => {
    const defaultMethod = availablePaymentMethods.find(m => m.currency === 'AWG');
    setPayments(prev => [...prev, createDefaultPayment(defaultMethod)]);
  };

  const removePayment = (index: number) => {
    if (payments.length > 1) {
      setPayments(prev => prev.filter((_, i) => i !== index));
    }
  };

  const updatePayment = (index: number, field: keyof PaymentEntryData, value: string, packageAmount?: number) => {
    setPayments(prev => prev.map((payment, i) => {
      if (i === index) {
        return updatePaymentEntry(payment, field, value, availablePaymentMethods, packageAmount);
      }
      return payment;
    }));
  };

  const resetPayments = () => {
    setPayments([createDefaultPayment(defaultMethod)]);
  };

  const getSymbol = (currency: string) => {
    return getCurrencySymbol(currency, availablePaymentMethods);
  };

  const getValidPaymentsData = () => {
    return getValidPayments(payments);
  };

  return {
    payments,
    addPayment,
    removePayment,
    updatePayment,
    resetPayments,
    getCurrencySymbol: getSymbol,
    getValidPayments: getValidPaymentsData,
    availablePaymentMethods
  };
}
