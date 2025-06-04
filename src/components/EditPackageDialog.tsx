
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CustomerSearchSelector } from './CustomerSearchSelector';
import { TripSelector } from './TripSelector';
import { EditPackageForm } from './EditPackageForm';

interface Package {
  id: string;
  tracking_number: string;
  customer_id: string;
  trip_id: string | null;
  description: string;
  weight: number | null;
  freight: number | null;
  amount_to_collect: number | null;
  currency?: string;
  status: string;
}

interface EditPackageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  package: Package | null;
  onSuccess: () => void;
}

export function EditPackageDialog({ open, onOpenChange, package: pkg, onSuccess }: EditPackageDialogProps) {
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedTripId, setSelectedTripId] = useState('');

  // Initialize form when dialog opens with package data
  useEffect(() => {
    if (pkg && open) {
      console.log('🔍 [EditPackageDialog] Inicializando con paquete:', pkg);
      console.log('💱 [EditPackageDialog] Package currency EXACTA de DB:', pkg.currency);
      console.log('📊 [EditPackageDialog] Customer ID:', pkg.customer_id);
      console.log('📊 [EditPackageDialog] Trip ID:', pkg.trip_id);
      
      // Set the IDs immediately when package is available
      setSelectedCustomerId(pkg.customer_id || '');
      setSelectedTripId(pkg.trip_id || '');
    }
  }, [pkg?.id, open]);

  // Reset when dialog closes
  useEffect(() => {
    if (!open) {
      setSelectedCustomerId('');
      setSelectedTripId('');
    }
  }, [open]);

  const handleSuccess = () => {
    onOpenChange(false);
    onSuccess();
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  if (!pkg) return null;

  const displayCurrency = pkg.currency && ['COP', 'AWG'].includes(pkg.currency) ? pkg.currency : 'COP';

  console.log('🎯 [EditPackageDialog] Renderizando con moneda:', displayCurrency);
  console.log('🎯 [EditPackageDialog] Paquete completo:', {
    id: pkg.id,
    tracking_number: pkg.tracking_number,
    currency: pkg.currency,
    amount_to_collect: pkg.amount_to_collect
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Editar Encomienda</DialogTitle>
          <DialogDescription>
            Modificar la información de la encomienda {pkg.tracking_number}.
            <span className="block text-sm text-blue-600 mt-1">
              Moneda original: {displayCurrency}
            </span>
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto space-y-4 min-h-0">
          <div className="grid grid-cols-2 gap-4">
            <CustomerSearchSelector
              selectedCustomerId={selectedCustomerId}
              onCustomerChange={setSelectedCustomerId}
              readOnly={true}
              key={`customer-${pkg.customer_id}`}
            />

            <TripSelector
              selectedTripId={selectedTripId}
              onTripChange={setSelectedTripId}
              readOnly={true}
              key={`trip-${pkg.trip_id}`}
            />
          </div>

          <EditPackageForm
            package={pkg}
            customerId={selectedCustomerId}
            tripId={selectedTripId}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
