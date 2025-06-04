
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { usePaymentMethods } from '@/hooks/usePaymentMethods';
import { RecordPaymentContent } from './RecordPaymentContent';
import { formatPackageDescription } from '@/utils/descriptionFormatter';
import type { PaymentEntryData } from '@/types/payment';

interface RecordPaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  customer: {
    id: string;
    customer_name: string;
    phone: string;
    total_pending_amount: number;
    package_numbers: string;
  } | null;
  onPaymentRecorded: () => void;
}

export function RecordPaymentDialog({ 
  isOpen, 
  onClose, 
  customer, 
  onPaymentRecorded 
}: RecordPaymentDialogProps) {
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [customerPackages, setCustomerPackages] = useState<any[]>([]);
  const { toast } = useToast();
  const isMobile = useIsMobile();
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

  // Crear un objeto package basado en los datos reales del cliente
  const mockPackage = customer && customerPackages.length > 0 ? {
    id: 'payment-mock',
    tracking_number: customer.package_numbers,
    destination: customerPackages[0].destination, // Usar el destino real del primer paquete
    description: customerPackages.length === 1 
      ? customerPackages[0].description 
      : formatPackageDescription(customerPackages.map(p => p.description).join(', ')),
    amount_to_collect: customer.total_pending_amount,
    currency: customerPackages[0].currency || 'COP',
    customers: {
      name: customer.customer_name
    }
  } : null;

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      setNotes('');
      const defaultMethod = paymentMethods.find(m => m.currency === 'COP');
      setPayment({
        methodId: defaultMethod?.id || '',
        amount: '',
        currency: 'COP',
        type: 'partial'
      });
    }
  }, [isOpen, paymentMethods]);

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

  const handleSubmit = async () => {
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

      // Registrar el pago
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

      toast({
        title: 'Pago registrado',
        description: `Se registró un pago por ${payment.currency} ${parseFloat(payment.amount).toLocaleString('es-CO')} para ${customer.customer_name}`,
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

  if (!customer || !mockPackage) return null;

  const contentProps = {
    customer,
    mockPackage,
    payments: [payment], // Convert single payment to array for compatibility
    notes,
    isLoading,
    onAddPayment: () => {}, // Not needed for single payment
    onUpdatePayment: handlePaymentUpdate,
    onRemovePayment: () => {}, // Not needed for single payment
    onNotesChange: setNotes,
    onCancel: onClose,
    onSubmit: handleSubmit,
    getCurrencySymbol
  };

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="w-full max-w-[95vw] overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              Registrar Pago
            </SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <RecordPaymentContent {...contentProps} />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Registrar Pago
          </DialogTitle>
        </DialogHeader>
        <RecordPaymentContent {...contentProps} />
      </DialogContent>
    </Dialog>
  );
}
