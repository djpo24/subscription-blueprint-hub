
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';

interface PackageLabelsDialogActionsProps {
  selectedPackageIds: Set<string>;
  selectedPrintedPackageIds: Set<string>;
  onPrintSelected: () => void;
  onReprintSelected: () => void;
  variant?: 'header' | 'footer';
}

export function PackageLabelsDialogActions({
  selectedPackageIds,
  selectedPrintedPackageIds,
  onPrintSelected,
  onReprintSelected,
  variant = 'footer'
}: PackageLabelsDialogActionsProps) {
  const containerClass = variant === 'header' ? 'flex gap-2 pt-4' : 'flex gap-2';
  
  return (
    <div className={containerClass}>
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
  );
}
