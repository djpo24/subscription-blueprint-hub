
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CustomerSearchSelector } from './CustomerSearchSelector';
import { TripSelector } from './TripSelector';
import { EditPackageFormNew } from './EditPackageFormNew';

type Currency = 'COP' | 'AWG';

interface Package {
  id: string;
  tracking_number: string;
  customer_id: string;
  trip_id: string | null;
  description: string;
  weight: number | null;
  freight: number | null;
  amount_to_collect: number | null;
  currency: Currency;
  status: string;
}

interface EditPackageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  package: Package | null;
  tripId?: string;
  onSuccess: () => void;
}

export function EditPackageDialog({ open, onOpenChange, package: pkg, tripId, onSuccess }: EditPackageDialogProps) {
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedTripId, setSelectedTripId] = useState('');

  // Initialize form when dialog opens with package data
  useEffect(() => {
    if (pkg && open) {
      console.log('🚀 [EditPackageDialog] Initializing dialog with package and trip:', {
        packageId: pkg.id,
        tracking_number: pkg.tracking_number,
        customer_id: pkg.customer_id,
        package_trip_id: pkg.trip_id,
        passed_trip_id: tripId,
        currency: pkg.currency,
        amount_to_collect: pkg.amount_to_collect
      });
      
      // Use the passed tripId or fallback to package's trip_id
      const finalTripId = tripId || pkg.trip_id || '';
      
      setSelectedCustomerId(pkg.customer_id || '');
      setSelectedTripId(finalTripId);
    }
  }, [pkg, tripId, open]);

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

  // Display currency with validation
  const currencyDisplay: Currency = (pkg.currency === 'AWG' || pkg.currency === 'COP') ? pkg.currency : 'COP';
  console.log('🎯 [EditPackageDialog] Package currency for display:', {
    original: pkg.currency,
    display: currencyDisplay,
    customer_id: pkg.customer_id,
    selectedCustomerId: selectedCustomerId,
    selectedTripId: selectedTripId
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Editar Encomienda</DialogTitle>
          <DialogDescription>
            Modificar la información de la encomienda {pkg.tracking_number}.
            <div className="mt-2 text-sm">
              <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                Divisa: {currencyDisplay}
              </span>
              {pkg.amount_to_collect && (
                <span className="inline-block bg-green-100 text-green-800 px-2 py-1 rounded text-xs ml-2">
                  Monto: {currencyDisplay} ${pkg.amount_to_collect.toLocaleString()}
                </span>
              )}
              <span className="inline-block bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs ml-2">
                Cliente ID: {selectedCustomerId || 'No asignado'}
              </span>
              <span className="inline-block bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs ml-2">
                Viaje ID: {selectedTripId || 'No asignado'}
              </span>
            </div>
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto space-y-4 min-h-0">
          <div className="grid grid-cols-2 gap-4">
            <CustomerSearchSelector
              selectedCustomerId={selectedCustomerId}
              onCustomerChange={setSelectedCustomerId}
              readOnly={true}
              key={`customer-${pkg.customer_id}-${selectedCustomerId}`}
            />

            <TripSelector
              selectedTripId={selectedTripId}
              onTripChange={setSelectedTripId}
              readOnly={true}
              key={`trip-${selectedTripId}`}
            />
          </div>

          <EditPackageFormNew
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
