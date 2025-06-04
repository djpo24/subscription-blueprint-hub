
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
  const {
    notes,
    setNotes,
    isLoading,
    payments, // Ahora es un array
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

  if (!customer || !mockPackage) {
    return null;
  }

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
          mockPackage={mockPackage}
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
