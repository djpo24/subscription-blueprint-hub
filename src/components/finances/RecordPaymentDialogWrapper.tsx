
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import { RecordPaymentContent } from './RecordPaymentContent';
import { useRecordPaymentDialog } from '@/hooks/useRecordPaymentDialog';
import type { RecordPaymentDialogProps } from '@/types/recordPayment';

export function RecordPaymentDialogWrapper({ 
  isOpen, 
  onClose, 
  customer, 
  onPaymentRecorded 
}: RecordPaymentDialogProps) {
  const isMobile = useIsMobile();
  
  const {
    notes,
    setNotes,
    isLoading,
    payment,
    mockPackage,
    handlePaymentUpdate,
    getCurrencySymbol,
    handleSubmit
  } = useRecordPaymentDialog(customer, isOpen);

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
    onSubmit: () => handleSubmit(onPaymentRecorded, onClose),
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
