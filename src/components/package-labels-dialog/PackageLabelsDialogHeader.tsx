
import { DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Package } from 'lucide-react';
import { format } from 'date-fns';

interface PackageLabelsDialogHeaderProps {
  tripDate: Date;
}

export function PackageLabelsDialogHeader({ tripDate }: PackageLabelsDialogHeaderProps) {
  return (
    <DialogHeader>
      <DialogTitle className="flex items-center gap-2">
        <Package className="h-5 w-5" />
        Gestión de Etiquetas - {format(tripDate, 'dd/MM/yyyy')}
      </DialogTitle>
      <DialogDescription>
        Gestiona las etiquetas de las encomiendas del viaje
      </DialogDescription>
    </DialogHeader>
  );
}
