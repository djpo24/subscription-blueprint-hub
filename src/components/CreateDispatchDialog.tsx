
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useCreateDispatch } from '@/hooks/useCreateDispatch';
import { useDispatchEligiblePackages } from '@/hooks/useDispatchEligiblePackages';
import { DispatchDialogHeader } from './dispatch/DispatchDialogHeader';
import { DispatchDateInfo } from './dispatch/DispatchDateInfo';
import { DispatchPackageSelector } from './dispatch/DispatchPackageSelector';
import { DispatchSummary } from './dispatch/DispatchSummary';
import { DispatchNotesField } from './dispatch/DispatchNotesField';

interface PackageInfo {
  id: string;
  tracking_number: string;
  origin: string;
  destination: string;
  status: string;
  description: string;
  weight: number | null;
  freight: number | null;
  amount_to_collect: number | null;
  customers: {
    name: string;
    email: string;
  } | null;
}

interface Trip {
  id: string;
  origin: string;
  destination: string;
  flight_number: string | null;
  packages: any[];
}

interface CreateDispatchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tripDate: Date;
  trips: Trip[];
  onSuccess?: () => void;
}

export function CreateDispatchDialog({ 
  open, 
  onOpenChange, 
  tripDate, 
  trips, 
  onSuccess 
}: CreateDispatchDialogProps) {
  const [selectedPackages, setSelectedPackages] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const createDispatch = useCreateDispatch();

  // Obtener solo paquetes elegibles para despacho
  const eligiblePackages = useDispatchEligiblePackages(trips);

  console.log('🔍 [CreateDispatchDialog] Component rendered with:', {
    open,
    tripsReceived: trips.length,
    eligiblePackages: eligiblePackages.length,
    selectedPackages: selectedPackages.length
  });

  // Log adicional para debugging
  console.log('📦 [CreateDispatchDialog] All trips data:', trips.map(t => ({
    id: t.id,
    packagesCount: t.packages.length,
    packageStatuses: t.packages.map(p => `${p.tracking_number}: ${p.status}`)
  })));

  const handlePackageToggle = (packageId: string, checked: boolean) => {
    if (checked) {
      setSelectedPackages(prev => [...prev, packageId]);
    } else {
      setSelectedPackages(prev => prev.filter(id => id !== packageId));
    }
  };

  const handleSelectAll = () => {
    if (selectedPackages.length === eligiblePackages.length) {
      setSelectedPackages([]);
    } else {
      setSelectedPackages(eligiblePackages.map(pkg => pkg.id));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🚀 [CreateDispatchDialog] Submit attempt:', {
      selectedPackagesCount: selectedPackages.length,
      eligiblePackagesCount: eligiblePackages.length,
      isPending: createDispatch.isPending
    });
    
    if (selectedPackages.length === 0) {
      console.log('⚠️ [CreateDispatchDialog] Submit blocked: no packages selected');
      return;
    }

    try {
      const currentDate = new Date();
      console.log('📅 [CreateDispatchDialog] Creating dispatch with current date:', currentDate);
      console.log('📦 [CreateDispatchDialog] Selected packages:', selectedPackages.length);
      
      await createDispatch.mutateAsync({
        date: currentDate,
        packageIds: selectedPackages,
        notes: notes.trim() || undefined
      });
      
      setSelectedPackages([]);
      setNotes('');
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error('❌ [CreateDispatchDialog] Error creating dispatch:', error);
    }
  };

  // Fecha actual para mostrar en el diálogo
  const currentDate = new Date();

  // Debug: Check if button should be disabled
  const isButtonDisabled = selectedPackages.length === 0 || createDispatch.isPending;
  console.log('🔘 [CreateDispatchDialog] Button state:', {
    disabled: isButtonDisabled,
    reason: selectedPackages.length === 0 ? 'no packages selected' : createDispatch.isPending ? 'request pending' : 'enabled'
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DispatchDialogHeader currentDate={currentDate} tripDate={tripDate} />

        <form onSubmit={handleSubmit} className="space-y-6">
          <DispatchDateInfo currentDate={currentDate} />

          {eligiblePackages.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="text-lg font-medium mb-2">No hay encomiendas disponibles para despacho</p>
              <p className="text-sm mb-4">
                Para que las encomiendas aparezcan aquí, deben estar en estado "recibido", "bodega" o "procesado"
                y no haber sido despachadas anteriormente.
              </p>
              <div className="text-xs text-gray-400 bg-gray-50 p-3 rounded">
                <p className="mb-2"><strong>Estados elegibles para despacho:</strong></p>
                <ul className="list-disc list-inside space-y-1">
                  <li>"recibido" - Encomiendas que han llegado</li>
                  <li>"bodega" - Encomiendas en bodega</li>
                  <li>"procesado" - Encomiendas impresas (listas para despacho)</li>
                </ul>
                <p className="mt-3"><strong>Estados NO elegibles:</strong></p>
                <ul className="list-disc list-inside space-y-1">
                  <li>"delivered" - Ya entregadas</li>
                  <li>"in_transit" / "transito" - En tránsito</li>
                  <li>"en_destino" - En destino</li>
                </ul>
              </div>
            </div>
          ) : (
            <>
              <DispatchPackageSelector
                packages={eligiblePackages}
                selectedPackages={selectedPackages}
                onPackageToggle={handlePackageToggle}
                onSelectAll={handleSelectAll}
              />

              <DispatchSummary
                selectedPackages={selectedPackages}
                packages={eligiblePackages}
              />

              <DispatchNotesField
                notes={notes}
                onNotesChange={setNotes}
              />
            </>
          )}

          {/* Botones */}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={selectedPackages.length === 0 || createDispatch.isPending}
            >
              {createDispatch.isPending ? 'Creando...' : 'Crear Despacho'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
