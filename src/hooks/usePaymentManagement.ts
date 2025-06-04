
import { useState, useEffect } from 'react';
import { 
  createDefaultPayment,
  getCurrencySymbol as getSymbol,
  getValidPayments,
  updatePaymentEntry
} from '@/utils/paymentUtils';
import type { PaymentEntryData } from '@/types/payment';

export function usePaymentManagement(packageCurrency?: string) {
  const [payments, setPayments] = useState<PaymentEntryData[]>([]);

  console.log('🎯 [usePaymentManagement] Package currency received:', packageCurrency);

  // Initialize with one payment entry when component mounts
  useEffect(() => {
    // Use package currency or AWG as fallback (NOT COP as fallback)
    const currency = packageCurrency || 'AWG';
    console.log('🔄 [usePaymentManagement] Initializing with currency:', currency);
    console.log('🔄 [usePaymentManagement] Package currency was:', packageCurrency);
    
    // Create default payment with "efectivo" as default method
    const defaultPayment = createDefaultPayment();
    defaultPayment.currency = currency;
    defaultPayment.methodId = 'efectivo'; // Set efectivo as default
    
    console.log('🎯 [usePaymentManagement] Default payment created:', defaultPayment);
    console.log('🎯 [usePaymentManagement] Payment currency set to:', defaultPayment.currency);
    setPayments([defaultPayment]);
  }, [packageCurrency]);

  const addPayment = () => {
    const currency = packageCurrency || 'AWG';
    console.log('➕ [usePaymentManagement] Adding payment with currency:', currency);
    
    const newPayment = createDefaultPayment();
    newPayment.currency = currency;
    newPayment.methodId = 'efectivo'; // Set efectivo as default for new payments
    
    console.log('➕ [usePaymentManagement] New payment created:', newPayment);
    setPayments(prev => [...prev, newPayment]);
  };

  const updatePayment = (index: number, field: keyof PaymentEntryData, value: string, packageAmount?: number) => {
    console.log('💳 [usePaymentManagement] Updating payment:', { index, field, value, packageAmount });
    console.log('💳 [usePaymentManagement] Package currency context:', packageCurrency);
    
    setPayments(prev => 
      prev.map((payment, i) => 
        i === index 
          ? updatePaymentEntry(payment, field, value, [], packageAmount)
          : payment
      )
    );
  };

  const removePayment = (index: number) => {
    setPayments(prev => prev.filter((_, i) => i !== index));
  };

  const resetPayments = () => {
    const currency = packageCurrency || 'AWG';
    console.log('🔄 [usePaymentManagement] Resetting payments with currency:', currency);
    
    const defaultPayment = createDefaultPayment();
    defaultPayment.currency = currency;
    defaultPayment.methodId = 'efectivo'; // Set efectivo as default
    
    console.log('🔄 [usePaymentManagement] Reset payment created:', defaultPayment);
    setPayments([defaultPayment]);
  };

  const getCurrencySymbol = (currency: string) => {
    const symbol = getSymbol(currency, []);
    console.log('💱 [usePaymentManagement] Currency symbol for', currency, ':', symbol);
    return symbol;
  };

  const getValidPaymentsForSubmission = () => {
    const validPayments = getValidPayments(payments);
    console.log('✅ [usePaymentManagement] Valid payments for submission:', validPayments);
    return validPayments;
  };

  return {
    payments,
    addPayment,
    updatePayment,
    removePayment,
    resetPayments,
    getCurrencySymbol,
    getValidPayments: getValidPaymentsForSubmission,
    availablePaymentMethods: [] // Not needed anymore since we use fixed methods
  };
}
