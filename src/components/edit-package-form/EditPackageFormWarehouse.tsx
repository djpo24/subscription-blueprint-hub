
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { usePackageActions } from '@/hooks/usePackageActions';
import { Warehouse } from 'lucide-react';

interface Package {
  id: string;
  tracking_number: string;
}

interface EditPackageFormWarehouseProps {
  package: Package;
  onSuccess: () => void;
}

export function EditPackageFormWarehouse({ package: pkg, onSuccess }: EditPackageFormWarehouseProps) {
  const [showWarehouseDialog, setShowWarehouseDialog] = useState(false);
  const { moveToWarehouse } = usePackageActions();

  const handleMoveToWarehouse = () => {
    moveToWarehouse(pkg.id);
    setShowWarehouseDialog(false);
    onSuccess();
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={() => setShowWarehouseDialog(true)}
        className="flex items-center gap-2"
      >
        <Warehouse className="h-4 w-4" />
        Mover a Bodega
      </Button>

      <AlertDialog open={showWarehouseDialog} onOpenChange={setShowWarehouseDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Mover a bodega?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción moverá la encomienda {pkg.tracking_number} a bodega y 
              la desasignará del viaje actual.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleMoveToWarehouse}>
              Mover a Bodega
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
