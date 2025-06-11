import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useDispatchEligiblePackagesSimple } from '@/hooks/useDispatchEligiblePackagesSimple';
import { useCreateDispatchSimple } from '@/hooks/useCreateDispatchSimple';
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
  const createDispatch = useCreateDispatchSimple();

  // Usar el nuevo hook simplificado
  const eligiblePackages = useDispatchEligiblePackagesSimple(trips);

  console.log('🚀 [SOLUCIÓN RADICAL] === DIÁLOGO SIMPLIFICADO ===');
  console.log('🚀 [SOLUCIÓN RADICAL] Diálogo abierto:', open);
  console.log('🚀 [SOLUCIÓN RADICAL] Viajes:', trips.length);
  console.log('🚀 [SOLUCIÓN RADICAL] Paquetes elegibles:', eligiblePackages.length);
  console.log('🚀 [SOLUCIÓN RADICAL] Paquetes seleccionados:', selectedPackages.length);

  const handlePackageToggle = (packageId: string, checked: boolean) => {
    console.log('🔄 [SOLUCIÓN RADICAL] Toggle paquete:', packageId, checked);
    if (checked) {
      setSelectedPackages(prev => [...prev, packageId]);
    } else {
      setSelectedPackages(prev => prev.filter(id => id !== packageId));
    }
  };

  const handleSelectAll = () => {
    console.log('🔄 [SOLUCIÓN RADICAL] Seleccionar todo');
    if (selectedPackages.length === eligiblePackages.length) {
      setSelectedPackages([]);
    } else {
      setSelectedPackages(eligiblePackages.map(pkg => pkg.id));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🚀 [SOLUCIÓN RADICAL] === ENVIANDO DESPACHO ===');
    console.log('🚀 [SOLUCIÓN RADICAL] Paquetes seleccionados:', selectedPackages.length);
    
    if (selectedPackages.length === 0) {
      console.log('❌ [SOLUCIÓN RADICAL] No hay paquetes seleccionados');
      return;
    }

    try {
      console.log('📤 [SOLUCIÓN RADICAL] Ejecutando mutación...');
      
      await createDispatch.mutateAsync({
        packageIds: selectedPackages,
        notes: notes.trim() || undefined
      });
      
      console.log('✅ [SOLUCIÓN RADICAL] Despacho creado exitosamente');
      
      // Limpiar y cerrar
      setSelectedPackages([]);
      setNotes('');
      onOpenChange(false);
      onSuccess?.();
      
    } catch (error) {
      console.error('❌ [SOLUCIÓN RADICAL] Error en submit:', error);
    }
  };

  const currentDate = new Date();
  const isButtonDisabled = selectedPackages.length === 0 || createDispatch.isPending;

  console.log('🔘 [SOLUCIÓN RADICAL] Botón deshabilitado:', isButtonDisabled);

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
                Solo se pueden despachar encomiendas en estados válidos.
              </p>
              <div className="text-xs text-gray-400 bg-gray-50 p-4 rounded">
                <p className="mb-3"><strong>🔍 SOLUCIÓN RADICAL ACTIVADA:</strong></p>
                <ul className="list-disc list-inside space-y-1 text-left">
                  <li><strong>Estados válidos:</strong> recibido, procesado, pending, arrived</li>
                  <li><strong>Lógica simplificada:</strong> sin verificaciones complejas</li>
                  <li><strong>Creación directa:</strong> sin filtros adicionales</li>
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

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            {eligiblePackages.length > 0 && (
              <Button
                type="submit"
                disabled={isButtonDisabled}
                className={`${isButtonDisabled ? 'opacity-50 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
              >
                {createDispatch.isPending ? 'Creando...' : `🚀 CREAR DESPACHO ${selectedPackages.length > 0 ? `(${selectedPackages.length})` : ''}`}
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
