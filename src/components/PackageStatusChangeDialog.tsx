
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useChangePackageStatus } from '@/hooks/useChangePackageStatus';

interface PackageStatusChangeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  package: {
    id: string;
    tracking_number: string;
    status: string;
  };
  onSuccess: () => void;
}

export function PackageStatusChangeDialog({ 
  open, 
  onOpenChange, 
  package: pkg, 
  onSuccess 
}: PackageStatusChangeDialogProps) {
  const [selectedStatus, setSelectedStatus] = useState('');
  const { changeStatus, isChanging } = useChangePackageStatus();

  const statusOptions = [
    { value: 'recibido', label: 'Recibido' },
    { value: 'bodega', label: 'Bodega' },
    { value: 'procesado', label: 'Procesado' },
    { value: 'despachado', label: 'Despachado' },
    { value: 'transito', label: 'Tránsito' },
    { value: 'en_destino', label: 'En Destino' },
    { value: 'delivered', label: 'Entregado' }
  ];

  const handleSubmit = async () => {
    if (!selectedStatus) return;

    await changeStatus({ 
      packageId: pkg.id, 
      newStatus: selectedStatus 
    });

    onOpenChange(false);
    onSuccess();
    setSelectedStatus('');
  };

  const handleCancel = () => {
    onOpenChange(false);
    setSelectedStatus('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Cambiar Estado del Paquete</DialogTitle>
          <DialogDescription>
            Cambiar el estado de la encomienda {pkg.tracking_number}.
            <div className="mt-2 text-sm">
              <span className="font-medium">Estado actual:</span> {pkg.status}
            </div>
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Nuevo Estado</label>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar nuevo estado" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="gap-3">
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleCancel}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!selectedStatus || isChanging}
          >
            {isChanging ? 'Cambiando...' : 'Cambiar Estado'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
