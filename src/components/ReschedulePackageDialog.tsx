
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { TripSelector } from './TripSelector';
import { usePackageActions } from '@/hooks/usePackageActions';

interface Package {
  id: string;
  tracking_number: string;
  status: string;
  trip_id: string | null;
}

interface ReschedulePackageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  package: Package;
  onSuccess: () => void;
}

export function ReschedulePackageDialog({ 
  open, 
  onOpenChange, 
  package: pkg, 
  onSuccess 
}: ReschedulePackageDialogProps) {
  const [selectedTripId, setSelectedTripId] = useState(pkg.trip_id || '');
  const { reschedulePackage, isRescheduling } = usePackageActions();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedTripId || selectedTripId === pkg.trip_id) {
      return;
    }

    const success = await reschedulePackage(pkg.id, selectedTripId);
    if (success) {
      onOpenChange(false);
      onSuccess();
      setSelectedTripId('');
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    setSelectedTripId(pkg.trip_id || '');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Reprogramar Encomienda</DialogTitle>
          <DialogDescription>
            Cambiar el viaje para la encomienda {pkg.tracking_number}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="current-status">Estado actual</Label>
            <div className="text-sm text-gray-600 mt-1">
              {pkg.status === 'pending' ? 'Pendiente' :
               pkg.status === 'in_transit' ? 'En Tránsito' :
               pkg.status === 'delivered' ? 'Entregado' :
               pkg.status === 'delayed' ? 'Retrasado' :
               pkg.status === 'arrived' ? 'Llegado' : pkg.status}
            </div>
          </div>

          <TripSelector
            selectedTripId={selectedTripId}
            onTripChange={setSelectedTripId}
          />

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isRescheduling || !selectedTripId || selectedTripId === pkg.trip_id}
            >
              {isRescheduling ? 'Reprogramando...' : 'Reprogramar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
