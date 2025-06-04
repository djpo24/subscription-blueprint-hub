
import { useState, useEffect } from 'react';
import type { PaymentEntryData } from '@/types/payment';
import { usePaymentMethods } from '@/hooks/usePaymentMethods';

interface UsePaymentEntriesProps {
  isOpen: boolean;
  packageCurrency?: string;
  customerTotalAmount?: number;
}

export function usePaymentEntries({ isOpen, packageCurrency, customerTotalAmount }: UsePaymentEntriesProps) {
  const [payments, setPayments] = useState<PaymentEntryData[]>([]);
  const { data: paymentMethods = [] } = usePaymentMethods();

  // Reset and initialize payments when dialog opens
  useEffect(() => {
    if (isOpen && packageCurrency) {
      console.log('🔄 Resetting payment entries with package currency:', packageCurrency);
      
      const defaultMethod = paymentMethods.find(m => m.currency === packageCurrency) || 
                           paymentMethods.find(m => m.currency === 'COP');
      
      console.log('🎯 Setting default payment with currency:', packageCurrency);
      
      setPayments([{
        methodId: defaultMethod?.id || '',
        amount: '',
        currency: packageCurrency,
        type: 'partial'
      }]);
    }
  }, [isOpen, paymentMethods, packageCurrency]);

  const handlePaymentUpdate = (index: number, field: string, value: string) => {
    console.log('💳 Actualizando pago:', { index, field, value });
    
    setPayments(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      
      // Auto-calculate type based on amount
      if (field === 'amount' && customerTotalAmount) {
        const amount = parseFloat(value) || 0;
        updated[index].type = amount >= customerTotalAmount ? 'full' : 'partial';
      }
      
      // Update methodId when currency changes
      if (field === 'currency') {
        const methodForCurrency = paymentMethods.find(m => m.currency === value);
        if (methodForCurrency) {
          updated[index].methodId = methodForCurrency.id;
        }
      }
      
      console.log('💳 Updated payment:', updated[index]);
      return updated;
    });
  };

  const addPayment = () => {
    const currency = packageCurrency || 'COP';
    const defaultMethod = paymentMethods.find(m => m.currency === currency) || 
                         paymentMethods.find(m => m.currency === 'COP');
    
    setPayments(prev => [...prev, {
      methodId: defaultMethod?.id || '',
      amount: '',
      currency,
      type: 'partial'
    }]);
  };

  const removePayment = (index: number) => {
    setPayments(prev => prev.filter((_, i) => i !== index));
  };

  const getCurrencySymbol = (currency: string) => {
    const method = paymentMethods.find(m => m.currency === currency);
    const symbol = method?.symbol || '$';
    console.log('💱 Currency symbol for', currency, ':', symbol);
    return symbol;
  };

  return {
    payments,
    handlePaymentUpdate,
    addPayment,
    removePayment,
    getCurrencySymbol
  };
}
