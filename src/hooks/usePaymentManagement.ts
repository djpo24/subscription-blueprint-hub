
import { useState, useEffect } from 'react';
import { usePaymentMethods } from './usePaymentMethods';
import { 
  createDefaultPayment,
  filterAvailablePaymentMethods,
  getCurrencySymbol as getSymbol,
  getValidPayments,
  updatePaymentEntry,
  mapCurrencyForDB,
  mapCurrencyForUI
} from '@/utils/paymentUtils';
import type { PaymentEntryData } from '@/types/payment';

export function usePaymentManagement(packageCurrency?: string) {
  const { data: paymentMethods = [] } = usePaymentMethods();
  const [payments, setPayments] = useState<PaymentEntryData[]>([]);

  console.log('🎯 [usePaymentManagement] Package currency received:', packageCurrency);
  console.log('🎯 [usePaymentManagement] Available payment methods:', paymentMethods);

  // Filter payment methods to show only supported currencies
  const availablePaymentMethods = filterAvailablePaymentMethods(paymentMethods);

  // Initialize with one payment entry when component mounts
  useEffect(() => {
    // Usar la moneda del paquete o COP como fallback
    const currency = packageCurrency || 'COP';
    console.log('🔄 [usePaymentManagement] Initializing with currency:', currency);
    
    // Mapear la currency para buscar en BD (AWG -> ANG)
    const searchCurrency = mapCurrencyForDB(currency);
    console.log('🔄 [usePaymentManagement] Search currency in DB:', searchCurrency);
    
    // Buscar método de pago que coincida con la moneda mapeada
    const defaultMethod = availablePaymentMethods.find(m => m.currency === searchCurrency) || 
                         availablePaymentMethods.find(m => m.currency === 'COP') ||
                         availablePaymentMethods[0];
    
    console.log('🎯 [usePaymentManagement] Default method selected:', defaultMethod);
    
    if (defaultMethod) {
      const defaultPayment = createDefaultPayment(defaultMethod);
      // CRÍTICO: Usar la moneda original del paquete para la UI
      defaultPayment.currency = currency;
      defaultPayment.methodId = defaultMethod.id;
      console.log('🎯 [usePaymentManagement] Default payment created:', defaultPayment);
      setPayments([defaultPayment]);
    }
  }, [packageCurrency, availablePaymentMethods.length]);

  const addPayment = () => {
    const currency = packageCurrency || 'COP';
    console.log('➕ [usePaymentManagement] Adding payment with currency:', currency);
    
    const searchCurrency = mapCurrencyForDB(currency);
    const defaultMethod = availablePaymentMethods.find(m => m.currency === searchCurrency) || 
                         availablePaymentMethods[0];
    
    if (defaultMethod) {
      const newPayment = createDefaultPayment(defaultMethod);
      newPayment.currency = currency; // Usar la moneda original del paquete
      newPayment.methodId = defaultMethod.id;
      console.log('➕ [usePaymentManagement] New payment created:', newPayment);
      setPayments(prev => [...prev, newPayment]);
    }
  };

  const updatePayment = (index: number, field: keyof PaymentEntryData, value: string, packageAmount?: number) => {
    console.log('💳 [usePaymentManagement] Updating payment:', { index, field, value, packageAmount });
    
    setPayments(prev => 
      prev.map((payment, i) => 
        i === index 
          ? updatePaymentEntry(payment, field, value, availablePaymentMethods, packageAmount)
          : payment
      )
    );
  };

  const removePayment = (index: number) => {
    setPayments(prev => prev.filter((_, i) => i !== index));
  };

  const resetPayments = () => {
    const currency = packageCurrency || 'COP';
    console.log('🔄 [usePaymentManagement] Resetting payments with currency:', currency);
    
    const searchCurrency = mapCurrencyForDB(currency);
    const defaultMethod = availablePaymentMethods.find(m => m.currency === searchCurrency) || 
                         availablePaymentMethods[0];
    
    if (defaultMethod) {
      const defaultPayment = createDefaultPayment(defaultMethod);
      defaultPayment.currency = currency;
      defaultPayment.methodId = defaultMethod.id;
      console.log('🔄 [usePaymentManagement] Reset payment created:', defaultPayment);
      setPayments([defaultPayment]);
    } else {
      setPayments([]);
    }
  };

  const getCurrencySymbol = (currency: string) => {
    const symbol = getSymbol(currency, availablePaymentMethods);
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
    availablePaymentMethods
  };
}
