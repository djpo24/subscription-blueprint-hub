import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Package } from 'lucide-react';

interface DeleteBultoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bultoNumber: number;
  packages: any[];
  onConfirm: () => void;
  isDeleting: boolean;
}

export function DeleteBultoDialog({
  open,
  onOpenChange,
  bultoNumber,
  packages,
  onConfirm,
  isDeleting
}: DeleteBultoDialogProps) {
  const hasPackages = packages && packages.length > 0;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle>
            ¿Está seguro de eliminar el Bulto #{bultoNumber}?
          </AlertDialogTitle>
          <AlertDialogDescription>
            {hasPackages ? (
              <>
                Este bulto tiene {packages.length} paquete(s) asignado(s). 
                Los paquetes serán desasignados del bulto pero no serán eliminados.
              </>
            ) : (
              'Esta acción no se puede deshacer.'
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {hasPackages && (
          <div className="my-4">
            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Package className="h-4 w-4" />
              Paquetes en este Bulto:
            </h4>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {packages.map((pkg, index) => (
                <Card key={pkg.id}>
                  <CardContent className="py-3">
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-xs font-medium flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-mono text-sm font-semibold">
                            {pkg.tracking_number}
                          </p>
                          <Badge variant="outline" className="text-xs">
                            {pkg.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {pkg.customers?.name}
                        </p>
                        {pkg.description && (
                          <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                            {pkg.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? 'Eliminando...' : 'Eliminar Bulto'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
