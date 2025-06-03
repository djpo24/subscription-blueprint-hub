
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

export function usePaymentManagement(packageCurrency?: string) {
  const { data: paymentMethods = [] } = usePaymentMethods();
  
  // Filter payment methods for only Florín and Peso
  const availablePaymentMethods = filterAvailablePaymentMethods(paymentMethods);

  // Use package currency as default, fallback to AWG if not specified
  const defaultCurrency = packageCurrency && ['AWG', 'COP'].includes(packageCurrency) 
    ? packageCurrency 
    : 'AWG';
  
  const defaultMethod = availablePaymentMethods.find(m => m.currency === defaultCurrency) ||
                       availablePaymentMethods.find(m => m.currency === 'AWG');

  // Initialize with default payment entry using package currency
  const [payments, setPayments] = useState<PaymentEntryData[]>([
    createDefaultPayment(defaultMethod)
  ]);

  const addPayment = () => {
    // When adding new payments, use the same currency as the package
    const methodForCurrency = availablePaymentMethods.find(m => m.currency === defaultCurrency) ||
                             availablePaymentMethods.find(m => m.currency === 'AWG');
    setPayments(prev => [...prev, createDefaultPayment(methodForCurrency)]);
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
