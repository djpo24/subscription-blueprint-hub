
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

  console.log('🔍 [CreateDispatchDialog] === DIAGNÓSTICO DEL DIÁLOGO ===');
  console.log('🔍 [CreateDispatchDialog] Diálogo abierto:', open);
  console.log('🔍 [CreateDispatchDialog] Viajes recibidos:', trips.length);
  console.log('🔍 [CreateDispatchDialog] Paquetes elegibles:', eligiblePackages.length);
  console.log('🔍 [CreateDispatchDialog] Paquetes seleccionados:', selectedPackages.length);

  // Log detallado de viajes
  console.log('📊 [CreateDispatchDialog] Detalles de viajes:');
  trips.forEach((trip, index) => {
    console.log(`🚗 [CreateDispatchDialog] Viaje ${index + 1}:`, {
      id: trip.id,
      packagesCount: trip.packages?.length || 0,
      packages: trip.packages?.map(p => ({
        tracking: p.tracking_number,
        status: p.status
      })) || []
    });
  });

  const handlePackageToggle = (packageId: string, checked: boolean) => {
    console.log('🔄 [CreateDispatchDialog] Toggle paquete:', packageId, checked);
    if (checked) {
      setSelectedPackages(prev => [...prev, packageId]);
    } else {
      setSelectedPackages(prev => prev.filter(id => id !== packageId));
    }
  };

  const handleSelectAll = () => {
    console.log('🔄 [CreateDispatchDialog] Seleccionar todo. Estado actual:', selectedPackages.length, 'de', eligiblePackages.length);
    if (selectedPackages.length === eligiblePackages.length) {
      setSelectedPackages([]);
    } else {
      setSelectedPackages(eligiblePackages.map(pkg => pkg.id));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🚀 [CreateDispatchDialog] === INTENTO DE ENVÍO ===');
    console.log('🚀 [CreateDispatchDialog] Paquetes seleccionados:', selectedPackages.length);
    console.log('🚀 [CreateDispatchDialog] Está pendiente:', createDispatch.isPending);
    console.log('🚀 [CreateDispatchDialog] IDs seleccionados:', selectedPackages);
    
    if (selectedPackages.length === 0) {
      console.log('❌ [CreateDispatchDialog] ENVÍO BLOQUEADO: no hay paquetes seleccionados');
      return;
    }

    try {
      const currentDate = new Date();
      console.log('📅 [CreateDispatchDialog] Creando despacho para fecha:', currentDate);
      
      await createDispatch.mutateAsync({
        date: currentDate,
        packageIds: selectedPackages,
        notes: notes.trim() || undefined
      });
      
      console.log('✅ [CreateDispatchDialog] Despacho creado exitosamente');
      setSelectedPackages([]);
      setNotes('');
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error('❌ [CreateDispatchDialog] Error creando despacho:', error);
    }
  };

  // Fecha actual para mostrar en el diálogo
  const currentDate = new Date();

  // Debug: Check if button should be disabled
  const isButtonDisabled = selectedPackages.length === 0 || createDispatch.isPending;
  console.log('🔘 [CreateDispatchDialog] === ESTADO DEL BOTÓN ===');
  console.log('🔘 [CreateDispatchDialog] Botón deshabilitado:', isButtonDisabled);
  console.log('🔘 [CreateDispatchDialog] Razón:', 
    selectedPackages.length === 0 ? 'no hay paquetes seleccionados' : 
    createDispatch.isPending ? 'petición pendiente' : 
    'habilitado'
  );

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
                Para que las encomiendas aparezcan aquí, deben estar en estado "recibido", "bodega", "procesado", "pending" o "arrived"
                y no haber sido despachadas anteriormente.
              </p>
              <div className="text-xs text-gray-400 bg-gray-50 p-3 rounded">
                <p className="mb-2"><strong>Estados elegibles para despacho:</strong></p>
                <ul className="list-disc list-inside space-y-1">
                  <li>"recibido" - Encomiendas que han llegado</li>
                  <li>"bodega" - Encomiendas en bodega</li>
                  <li>"procesado" - Encomiendas impresas (listas para despacho)</li>
                  <li>"pending" - Encomiendas pendientes</li>
                  <li>"arrived" - Encomiendas que han llegado</li>
                </ul>
                <p className="mt-3"><strong>Estados NO elegibles:</strong></p>
                <ul className="list-disc list-inside space-y-1">
                  <li>"delivered" - Ya entregadas</li>
                  <li>"in_transit" / "transito" - En tránsito</li>
                  <li>"en_destino" - En destino</li>
                </ul>
                <p className="mt-3 text-amber-600">
                  <strong>💡 Consejo:</strong> Revisa la consola del navegador (F12) para ver el diagnóstico detallado.
                </p>
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
              className={`${selectedPackages.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {createDispatch.isPending ? 'Creando...' : `Crear Despacho ${selectedPackages.length > 0 ? `(${selectedPackages.length})` : ''}`}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
