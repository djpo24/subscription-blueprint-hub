
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useRecordPaymentDialog } from '@/hooks/useRecordPaymentDialog';
import { RecordPaymentContent } from './RecordPaymentContent';
import type { RecordPaymentDialogProps } from '@/types/recordPayment';

export function RecordPaymentDialogWrapper({
  isOpen,
  onClose,
  customer,
  onPaymentRecorded
}: RecordPaymentDialogProps) {
  // USAR LA MISMA LÓGICA DE HOOK QUE EL FORMULARIO MÓVIL
  const {
    notes,
    setNotes,
    isLoading,
    payments, // Ahora es PaymentEntryData[] como en el formulario móvil
    mockPackage,
    handlePaymentUpdate,
    addPayment,
    removePayment,
    getCurrencySymbol,
    handleSubmit
  } = useRecordPaymentDialog(customer, isOpen);

  const handleSubmitWrapper = () => {
    handleSubmit(onPaymentRecorded, onClose);
  };

  console.log('🎭 Dialog state:', { isOpen, customer, mockPackage });

  if (!customer) {
    console.log('❌ No customer provided to dialog');
    return null;
  }

  // IDÉNTICA lógica de fallback que en el formulario móvil
  const displayPackage = mockPackage || {
    id: customer.id,
    tracking_number: customer.package_numbers,
    customer_id: customer.id,
    amount_to_collect: customer.total_pending_amount,
    currency: 'COP',
    status: 'delivered',
    destination: 'Unknown'
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Registrar Pago - {customer.customer_name}
          </DialogTitle>
        </DialogHeader>

        <RecordPaymentContent
          customer={customer}
          mockPackage={displayPackage}
          payments={payments}
          notes={notes}
          isLoading={isLoading}
          onAddPayment={addPayment}
          onUpdatePayment={handlePaymentUpdate}
          onRemovePayment={removePayment}
          onNotesChange={setNotes}
          onCancel={onClose}
          onSubmit={handleSubmitWrapper}
          getCurrencySymbol={getCurrencySymbol}
        />
      </DialogContent>
    </Dialog>
  );
}
