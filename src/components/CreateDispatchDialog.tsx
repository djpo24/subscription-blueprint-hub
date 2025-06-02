
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useCreateDispatch } from '@/hooks/useCreateDispatch';
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

interface CreateDispatchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tripDate: Date; // Solo para mostrar en el título, pero usaremos fecha actual para el despacho
  packages: PackageInfo[];
  onSuccess?: () => void;
}

export function CreateDispatchDialog({ 
  open, 
  onOpenChange, 
  tripDate, 
  packages, 
  onSuccess 
}: CreateDispatchDialogProps) {
  const [selectedPackages, setSelectedPackages] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const createDispatch = useCreateDispatch();

  const handlePackageToggle = (packageId: string, checked: boolean) => {
    if (checked) {
      setSelectedPackages(prev => [...prev, packageId]);
    } else {
      setSelectedPackages(prev => prev.filter(id => id !== packageId));
    }
  };

  const handleSelectAll = () => {
    if (selectedPackages.length === packages.length) {
      setSelectedPackages([]);
    } else {
      setSelectedPackages(packages.map(pkg => pkg.id));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedPackages.length === 0) return;

    try {
      // Usar la fecha actual para el despacho
      const currentDate = new Date();
      console.log('📅 Creando despacho con fecha actual:', currentDate);
      console.log('📅 Fecha del viaje (solo referencia):', tripDate);
      
      await createDispatch.mutateAsync({
        date: currentDate, // Usar fecha actual
        packageIds: selectedPackages,
        notes: notes.trim() || undefined
      });
      
      setSelectedPackages([]);
      setNotes('');
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error('Error creating dispatch:', error);
    }
  };

  // Fecha actual para mostrar en el diálogo
  const currentDate = new Date();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DispatchDialogHeader currentDate={currentDate} tripDate={tripDate} />

        <form onSubmit={handleSubmit} className="space-y-6">
          <DispatchDateInfo currentDate={currentDate} />

          <DispatchPackageSelector
            packages={packages}
            selectedPackages={selectedPackages}
            onPackageToggle={handlePackageToggle}
            onSelectAll={handleSelectAll}
          />

          <DispatchSummary
            selectedPackages={selectedPackages}
            packages={packages}
          />

          <DispatchNotesField
            notes={notes}
            onNotesChange={setNotes}
          />

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
