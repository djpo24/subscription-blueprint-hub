
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { InlineCustomerForm } from './InlineCustomerForm';

interface CustomerFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (customerId: string) => void;
  initialPhone?: {
    countryCode: string;
    phoneNumber: string;
  };
}

export function CustomerFormDialog({ 
  open, 
  onOpenChange, 
  onSuccess, 
  initialPhone 
}: CustomerFormDialogProps) {
  const handleSuccess = (customerId: string) => {
    onSuccess(customerId);
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Crear Nuevo Cliente</DialogTitle>
          <DialogDescription>
            Completa la información para crear un nuevo cliente.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto min-h-0">
          <InlineCustomerForm
            onSuccess={handleSuccess}
            onCancel={handleCancel}
            initialPhone={initialPhone}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
