import { useState } from 'react';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { PackageX, PackagePlus } from 'lucide-react';

interface BultoInfo {
  id: string;
  bulto_number: number;
  label_id: string;
  label_number: number;
  is_main: boolean;
}

interface PackageConflictDialogProps {
  open: boolean;
  packageInfo: {
    tracking_number: string;
    customer_name?: string;
    otherBultos?: BultoInfo[];
  } | null;
  onMove: (selectedBultoIds: string[]) => void;
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
  const [selectedBultos, setSelectedBultos] = useState<string[]>([]);

  if (!packageInfo) return null;

  const otherBultos = packageInfo.otherBultos || [];
  const hasMultipleBultos = otherBultos.length > 1;

  const handleBultoToggle = (bultoId: string) => {
    setSelectedBultos(prev => 
      prev.includes(bultoId) 
        ? prev.filter(id => id !== bultoId)
        : [...prev, bultoId]
    );
  };

  const handleSelectAll = () => {
    if (selectedBultos.length === otherBultos.length) {
      setSelectedBultos([]);
    } else {
      setSelectedBultos(otherBultos.map(b => b.id));
    }
  };

  const handleMoveSelected = () => {
    if (hasMultipleBultos && selectedBultos.length === 0) {
      return;
    }
    onMove(hasMultipleBultos ? selectedBultos : otherBultos.map(b => b.id));
  };

  return (
    <AlertDialog open={open} onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle>⚠️ Paquete ya asignado</AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <div>
              <p className="font-medium text-foreground">
                Este paquete aparece en {otherBultos.length} bulto{otherBultos.length > 1 ? 's' : ''}:
              </p>
              <p className="text-sm mt-1">
                <span className="font-semibold">Paquete:</span> {packageInfo.tracking_number}
              </p>
              {packageInfo.customer_name && (
                <p className="text-sm">
                  <span className="font-semibold">Cliente:</span> {packageInfo.customer_name}
                </p>
              )}
            </div>

            {hasMultipleBultos && (
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Checkbox 
                    id="select-all"
                    checked={selectedBultos.length === otherBultos.length}
                    onCheckedChange={handleSelectAll}
                  />
                  <label htmlFor="select-all" className="text-sm font-semibold cursor-pointer">
                    Seleccionar todos
                  </label>
                </div>
                <div className="space-y-2">
                  {otherBultos.map((bulto) => (
                    <div key={bulto.id} className="flex items-center gap-2 pl-6">
                      <Checkbox 
                        id={`bulto-${bulto.id}`}
                        checked={selectedBultos.includes(bulto.id)}
                        onCheckedChange={() => handleBultoToggle(bulto.id)}
                      />
                      <label htmlFor={`bulto-${bulto.id}`} className="text-sm cursor-pointer">
                        Bulto #{bulto.bulto_number} (Etiqueta #{bulto.label_number})
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!hasMultipleBultos && otherBultos.length === 1 && (
              <div className="mt-2 p-3 bg-muted rounded-lg">
                <p className="text-sm">
                  Bulto #{otherBultos[0].bulto_number} (Etiqueta #{otherBultos[0].label_number})
                </p>
              </div>
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
            onClick={handleMoveSelected}
            disabled={hasMultipleBultos && selectedBultos.length === 0}
            className="w-full sm:w-auto"
          >
            <PackageX className="h-4 w-4 mr-2" />
            {hasMultipleBultos 
              ? `Trasladar ${selectedBultos.length > 0 ? `(${selectedBultos.length})` : ''}`
              : 'Trasladar aquí'
            }
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
