
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { usePaymentMethods } from '@/hooks/usePaymentMethods';
import { formatPackageDescription } from '@/utils/descriptionFormatter';
import type { PaymentEntryData } from '@/types/payment';
import type { RecordPaymentCustomer } from '@/types/recordPayment';

interface Customer {
  id: string;
  customer_name: string;
  phone: string;
  total_pending_amount: number;
  package_numbers: string;
}

export function useRecordPaymentDialog(customer: RecordPaymentCustomer | null, isOpen: boolean) {
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [customerPackages, setCustomerPackages] = useState<any[]>([]);
  const { toast } = useToast();
  const { data: paymentMethods = [] } = usePaymentMethods();

  // Cambiar a array de pagos para consistencia con otros componentes
  const [payments, setPayments] = useState<PaymentEntryData[]>([]);

  // Fetch customer packages when dialog opens
  useEffect(() => {
    if (isOpen && customer) {
      fetchCustomerPackages();
    }
  }, [isOpen, customer]);

  const fetchCustomerPackages = async () => {
    if (!customer) return;

    try {
      console.log('🔍 Fetching packages for customer:', customer.id);
      const { data: packages, error } = await supabase
        .from('packages')
        .select('*')
        .eq('customer_id', customer.id)
        .eq('status', 'delivered')
        .gt('amount_to_collect', 0);

      if (error) throw error;
      
      console.log('📦 Fetched packages:', packages);
      setCustomerPackages(packages || []);
    } catch (error) {
      console.error('Error fetching customer packages:', error);
    }
  };

  // Create a package object based on real customer data
  const mockPackage = customer && customerPackages.length > 0 ? {
    id: 'payment-mock',
    tracking_number: customer.package_numbers,
    destination: customerPackages[0].destination,
    description: customerPackages.length === 1 
      ? customerPackages[0].description 
      : formatPackageDescription(customerPackages.map(p => p.description).join(', ')),
    amount_to_collect: customer.total_pending_amount,
    currency: customerPackages[0].currency || 'COP',
    customers: {
      name: customer.customer_name
    }
  } : null;

  console.log('💰 Mock package currency:', mockPackage?.currency);

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (isOpen && mockPackage) {
      console.log('🔄 Resetting form with package currency:', mockPackage.currency);
      setNotes('');
      
      // Usar la divisa del paquete como predeterminada
      const packageCurrency = mockPackage.currency || 'COP';
      const defaultMethod = paymentMethods.find(m => m.currency === packageCurrency) || 
                           paymentMethods.find(m => m.currency === 'COP');
      
      console.log('🎯 Setting default payment with currency:', packageCurrency);
      
      // Inicializar con un pago por defecto
      setPayments([{
        methodId: defaultMethod?.id || '',
        amount: '',
        currency: packageCurrency,
        type: 'partial'
      }]);
    }
  }, [isOpen, paymentMethods, mockPackage]);

  const handlePaymentUpdate = (index: number, field: string, value: string) => {
    console.log('💳 Actualizando pago:', { index, field, value });
    
    setPayments(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      
      // Auto-calculate type based on amount
      if (field === 'amount' && customer) {
        const amount = parseFloat(value) || 0;
        updated[index].type = amount >= customer.total_pending_amount ? 'full' : 'partial';
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
    const packageCurrency = mockPackage?.currency || 'COP';
    const defaultMethod = paymentMethods.find(m => m.currency === packageCurrency) || 
                         paymentMethods.find(m => m.currency === 'COP');
    
    setPayments(prev => [...prev, {
      methodId: defaultMethod?.id || '',
      amount: '',
      currency: packageCurrency,
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

  const handleSubmit = async (onPaymentRecorded: () => void, onClose: () => void) => {
    if (!customer) return;

    // Validar que haya al menos un pago válido
    const validPayments = payments.filter(p => p.methodId && p.amount && parseFloat(p.amount) > 0);
    if (validPayments.length === 0) {
      toast({
        title: 'Error',
        description: 'Por favor ingresa al menos un pago válido',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      // Get the first package ID for this customer (simplified approach)
      const { data: packages, error: packagesError } = await supabase
        .from('packages')
        .select('id')
        .eq('customer_id', customer.id)
        .eq('status', 'delivered')
        .gt('amount_to_collect', 0)
        .limit(1);

      if (packagesError) throw packagesError;
      if (!packages || packages.length === 0) {
        throw new Error('No se encontraron paquetes para este cliente');
      }

      // Register all valid payments
      for (const payment of validPayments) {
        const { error } = await supabase
          .from('customer_payments')
          .insert({
            customer_id: customer.id,
            package_id: packages[0].id,
            amount: parseFloat(payment.amount),
            payment_method: payment.methodId === 'efectivo' ? 'efectivo' : 
                           payment.methodId === 'transferencia' ? 'transferencia' :
                           payment.methodId === 'tarjeta' ? 'tarjeta' : 'otro',
            currency: payment.currency,
            notes: notes || null,
            created_by: 'Usuario actual' // TODO: Replace with actual user
          });

        if (error) throw error;
      }

      const totalPaid = validPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
      const currencySymbol = getCurrencySymbol(validPayments[0].currency);
      
      toast({
        title: 'Pago registrado',
        description: `Se registró un pago total por ${currencySymbol}${totalPaid.toLocaleString('es-CO')} ${validPayments[0].currency} para ${customer.customer_name}`,
      });

      onPaymentRecorded();
      onClose();
    } catch (error) {
      console.error('Error recording payment:', error);
      toast({
        title: 'Error',
        description: 'No se pudo registrar el pago',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    notes,
    setNotes,
    isLoading,
    payments, // Cambiado de payment a payments
    mockPackage,
    handlePaymentUpdate,
    addPayment,
    removePayment,
    getCurrencySymbol,
    handleSubmit
  };
}
