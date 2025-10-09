import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { PackageX, PackagePlus } from 'lucide-react';

interface PackageConflictDialogProps {
  open: boolean;
  packageInfo: {
    tracking_number: string;
    bulto_number: number;
    customer_name?: string;
  } | null;
  onMove: () => void;
  onAddAdditional: () => void;
  onCancel: () => void;
}

export function PackageConflictDialog({ 
  open, 
  packageInfo, 
  onMove, 
  onAddAdditional, 
  onCancel 
}: PackageConflictDialogProps) {
  if (!packageInfo) return null;

  return (
    <AlertDialog open={open} onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>⚠️ Paquete ya asignado</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p className="font-medium text-foreground">
              Este paquete ya ha sido asignado al Bulto #{packageInfo.bulto_number}
            </p>
            <p className="text-sm">
              <span className="font-semibold">Paquete:</span> {packageInfo.tracking_number}
            </p>
            {packageInfo.customer_name && (
              <p className="text-sm">
                <span className="font-semibold">Cliente:</span> {packageInfo.customer_name}
              </p>
            )}
            <p className="mt-4">
              ¿Qué deseas hacer?
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <Button 
            variant="outline" 
            onClick={onCancel}
            className="w-full sm:w-auto"
          >
            Cancelar
          </Button>
          <Button 
            variant="secondary" 
            onClick={onMove}
            className="w-full sm:w-auto"
          >
            <PackageX className="h-4 w-4 mr-2" />
            Trasladar aquí
          </Button>
          <Button 
            onClick={onAddAdditional}
            className="w-full sm:w-auto"
          >
            <PackagePlus className="h-4 w-4 mr-2" />
            Paq adicional
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
