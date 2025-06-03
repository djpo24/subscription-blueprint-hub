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

  // Initialize with single payment entry using package currency
  const [payments, setPayments] = useState<PaymentEntryData[]>([
    createDefaultPayment(defaultMethod)
  ]);

  // Simplified functions for single payment
  const addPayment = () => {
    // No longer needed - keeping for compatibility
  };

  const removePayment = (index: number) => {
    // No longer needed - keeping for compatibility
  };

  const updatePayment = (index: number, field: keyof PaymentEntryData, value: string, packageAmount?: number) => {
    if (index === 0) {
      setPayments(prev => [
        updatePaymentEntry(prev[0], field, value, availablePaymentMethods, packageAmount)
      ]);
    }
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
