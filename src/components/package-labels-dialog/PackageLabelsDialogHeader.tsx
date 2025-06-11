
import { DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';

interface PackageLabelsDialogHeaderProps {
  selectedPackageIds: Set<string>;
  selectedPrintedPackageIds: Set<string>;
  onPrintSelected: () => void;
  onReprintSelected: () => void;
}

export function PackageLabelsDialogHeader({
  selectedPackageIds,
  selectedPrintedPackageIds,
  onPrintSelected,
  onReprintSelected
}: PackageLabelsDialogHeaderProps) {
  return (
    <DialogHeader>
      <DialogTitle>Etiquetas de Encomiendas</DialogTitle>
      <DialogDescription>
        Gestiona e imprime etiquetas para las encomiendas seleccionadas
      </DialogDescription>
      
      {/* Botones de acción en la parte superior */}
      <div className="flex gap-2 pt-4">
        {selectedPackageIds.size > 0 && (
          <Button
            onClick={onPrintSelected}
            className="flex items-center gap-2"
          >
            <Printer className="h-4 w-4" />
            Imprimir Seleccionadas ({selectedPackageIds.size})
          </Button>
        )}

        {selectedPrintedPackageIds.size > 0 && (
          <Button
            onClick={onReprintSelected}
            className="flex items-center gap-2"
            variant="outline"
          >
            <Printer className="h-4 w-4" />
            Re-imprimir Seleccionadas ({selectedPrintedPackageIds.size})
          </Button>
        )}
      </div>
    </DialogHeader>
  );
}
