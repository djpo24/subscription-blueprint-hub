
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { usePaymentManagement } from '@/hooks/usePaymentManagement';
import { RecordPaymentContent } from './RecordPaymentContent';

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
  const { toast } = useToast();
  const isMobile = useIsMobile();

  // Crear un objeto package ficticio para reutilizar los componentes móviles
  const mockPackage = customer ? {
    id: 'payment-mock',
    tracking_number: customer.package_numbers,
    destination: 'Múltiples destinos',
    description: 'Pago de encomiendas pendientes',
    amount_to_collect: customer.total_pending_amount,
    currency: 'COP',
    customers: {
      name: customer.customer_name
    }
  } : null;

  const {
    payments,
    addPayment,
    updatePayment,
    removePayment,
    resetPayments,
    getCurrencySymbol,
    getValidPayments
  } = usePaymentManagement('COP');

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      setNotes('');
      resetPayments();
      // Agregar un pago inicial
      addPayment();
    }
  }, [isOpen, resetPayments, addPayment]);

  const handlePaymentUpdate = (index: number, field: string, value: string) => {
    console.log('💳 Actualizando pago:', { index, field, value });
    updatePayment(index, field as any, value, customer?.total_pending_amount || 0);
  };

  const handleSubmit = async () => {
    if (!customer) return;

    const validPayments = getValidPayments();
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

      // Registrar cada pago
      for (const payment of validPayments) {
        const { error } = await supabase
          .from('customer_payments')
          .insert({
            customer_id: customer.id,
            package_id: packages[0].id,
            amount: payment.amount,
            payment_method: payment.method_id === 'efectivo' ? 'efectivo' : 
                           payment.method_id === 'transferencia' ? 'transferencia' :
                           payment.method_id === 'tarjeta' ? 'tarjeta' : 'otro',
            currency: payment.currency,
            notes: notes || null,
            created_by: 'Usuario actual' // TODO: Replace with actual user
          });

        if (error) throw error;
      }

      const totalAmount = validPayments.reduce((sum, payment) => sum + payment.amount, 0);

      toast({
        title: 'Pagos registrados',
        description: `Se registraron pagos por un total de ${validPayments[0]?.currency || 'COP'} ${totalAmount.toLocaleString('es-CO')} para ${customer.customer_name}`,
      });

      onPaymentRecorded();
      onClose();
      setNotes('');
      resetPayments();
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
    payments,
    notes,
    isLoading,
    onAddPayment: addPayment,
    onUpdatePayment: handlePaymentUpdate,
    onRemovePayment: removePayment,
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
