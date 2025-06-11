
import { DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

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
    </DialogHeader>
  );
}
