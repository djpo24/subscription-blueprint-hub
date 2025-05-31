
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CustomerSearchSelector } from './CustomerSearchSelector';
import { TripSelector } from './TripSelector';
import { PackageForm } from './PackageForm';

interface PackageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  tripId?: string;
}

export function PackageDialog({ open, onOpenChange, onSuccess, tripId }: PackageDialogProps) {
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedTripId, setSelectedTripId] = useState(tripId || '');

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setSelectedCustomerId('');
      setSelectedTripId(tripId || '');
    }
  }, [open, tripId]);

  const handleSuccess = () => {
    // Reset form
    setSelectedCustomerId('');
    setSelectedTripId(tripId || '');
    onSuccess();
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Nueva Encomienda</DialogTitle>
          <DialogDescription>
            Completa la información para crear una nueva encomienda.
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="flex-1 -mx-6 px-6">
          <div className="space-y-4 pb-4">
            <div className="grid grid-cols-2 gap-4">
              <CustomerSearchSelector
                selectedCustomerId={selectedCustomerId}
                onCustomerChange={setSelectedCustomerId}
                key={open ? 'open' : 'closed'} // Force re-render when dialog opens
              />

              <TripSelector
                selectedTripId={selectedTripId}
                onTripChange={setSelectedTripId}
                disabled={!!tripId}
              />
            </div>

            <PackageForm
              customerId={selectedCustomerId}
              tripId={selectedTripId}
              onSuccess={handleSuccess}
              onCancel={handleCancel}
            />
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
