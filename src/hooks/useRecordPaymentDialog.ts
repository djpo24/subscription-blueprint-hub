
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

  // Simplified payment state - just one payment entry
  const [payment, setPayment] = useState<PaymentEntryData>({
    methodId: '',
    amount: '',
    currency: 'COP',
    type: 'partial'
  });

  // Fetch customer packages when dialog opens
  useEffect(() => {
    if (isOpen && customer) {
      fetchCustomerPackages();
    }
  }, [isOpen, customer]);

  const fetchCustomerPackages = async () => {
    if (!customer) return;

    try {
      const { data: packages, error } = await supabase
        .from('packages')
        .select('*')
        .eq('customer_id', customer.id)
        .eq('status', 'delivered')
        .gt('amount_to_collect', 0);

      if (error) throw error;
      
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
    currency: customerPackages[0].currency || 'COP', // Usar la divisa del primer paquete
    customers: {
      name: customer.customer_name
    }
  } : null;

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (isOpen && mockPackage) {
      setNotes('');
      // Usar la divisa del paquete como predeterminada
      const packageCurrency = mockPackage.currency || 'COP';
      const defaultMethod = paymentMethods.find(m => m.currency === packageCurrency) || 
                           paymentMethods.find(m => m.currency === 'COP');
      setPayment({
        methodId: defaultMethod?.id || '',
        amount: '',
        currency: packageCurrency,
        type: 'partial'
      });
    }
  }, [isOpen, paymentMethods, mockPackage]);

  const handlePaymentUpdate = (index: number, field: string, value: string) => {
    console.log('💳 Actualizando pago:', { index, field, value });
    
    setPayment(prev => {
      const updated = { ...prev, [field]: value };
      
      // Auto-calculate type based on amount
      if (field === 'amount' && customer) {
        const amount = parseFloat(value) || 0;
        updated.type = amount >= customer.total_pending_amount ? 'full' : 'partial';
      }
      
      // Update methodId when currency changes
      if (field === 'currency') {
        const methodForCurrency = paymentMethods.find(m => m.currency === value);
        if (methodForCurrency) {
          updated.methodId = methodForCurrency.id;
        }
      }
      
      return updated;
    });
  };

  const getCurrencySymbol = (currency: string) => {
    const method = paymentMethods.find(m => m.currency === currency);
    return method?.symbol || '$';
  };

  const handleSubmit = async (onPaymentRecorded: () => void, onClose: () => void) => {
    if (!customer) return;

    if (!payment.methodId || !payment.amount || parseFloat(payment.amount) <= 0) {
      toast({
        title: 'Error',
        description: 'Por favor ingresa un pago válido',
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

      // Register the payment
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

      const currencySymbol = getCurrencySymbol(payment.currency);
      toast({
        title: 'Pago registrado',
        description: `Se registró un pago por ${currencySymbol}${parseFloat(payment.amount).toLocaleString('es-CO')} ${payment.currency} para ${customer.customer_name}`,
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
    payment,
    mockPackage,
    handlePaymentUpdate,
    getCurrencySymbol,
    handleSubmit
  };
}
