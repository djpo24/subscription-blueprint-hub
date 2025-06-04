
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Check, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { usePaymentManagement } from '@/hooks/usePaymentManagement';
import { MobilePackageInfo } from '@/components/mobile/MobilePackageInfo';
import { MobilePaymentSection } from '@/components/mobile/MobilePaymentSection';
import { MobileDeliveryFormFields } from '@/components/mobile/MobileDeliveryFormFields';

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
            amount: parseFloat(payment.amount) || 0,
            payment_method: payment.methodId === 'efectivo' ? 'efectivo' : 
                           payment.methodId === 'transferencia' ? 'transferencia' :
                           payment.methodId === 'tarjeta' ? 'tarjeta' : 'otro',
            currency: payment.currency,
            notes: notes || null,
            created_by: 'Usuario actual' // TODO: Replace with actual user
          });

        if (error) throw error;
      }

      const totalAmount = validPayments.reduce((sum, payment) => sum + (parseFloat(payment.amount) || 0), 0);

      toast({
        title: 'Pagos registrados',
        description: `Se registraron pagos por un total de ${payment.currency} ${totalAmount.toLocaleString('es-CO')} para ${customer.customer_name}`,
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

  // Calcular totales de pago
  const totalCollected = payments.reduce((sum, payment) => {
    const amount = parseFloat(payment.amount) || 0;
    return sum + amount;
  }, 0);

  const remainingAmount = Math.max(0, (customer?.total_pending_amount || 0) - totalCollected);

  if (!customer || !mockPackage) return null;

  const PaymentContent = () => (
    <div className="space-y-4">
      {/* Package Info - usando el componente móvil */}
      <MobilePackageInfo package={mockPackage as any} />

      {/* Payment Section - usando el componente móvil */}
      <MobilePaymentSection
        package={mockPackage as any}
        payments={payments}
        onAddPayment={addPayment}
        onUpdatePayment={handlePaymentUpdate}
        onRemovePayment={removePayment}
        getCurrencySymbol={getCurrencySymbol}
      />

      {/* Delivery Form - Solo notas, omitiendo "entregado por" */}
      <div className="space-y-4">
        <MobileDeliveryFormFields
          deliveredBy=""
          setDeliveredBy={() => {}}
          notes={notes}
          setNotes={setNotes}
          hideDeliveredBy={true}
        />

        {/* Payment Warning for uncollected amounts */}
        {remainingAmount > 0 && (
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-3">
              <p className="text-sm text-orange-700">
                <strong>Atención:</strong> Queda un saldo pendiente de{' '}
                <strong>${remainingAmount.toLocaleString('es-CO')} COP</strong>.
                Puedes registrar más pagos arriba.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons - exactamente como en el móvil */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="w-full"
          >
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button
            type="button"
            disabled={isLoading || payments.length === 0}
            className="w-full"
            onClick={handleSubmit}
          >
            <Check className="h-4 w-4 mr-2" />
            {isLoading ? 'Registrando...' : 'Registrar Pago'}
          </Button>
        </div>
      </div>
    </div>
  );

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
            <PaymentContent />
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
        <PaymentContent />
      </DialogContent>
    </Dialog>
  );
}
