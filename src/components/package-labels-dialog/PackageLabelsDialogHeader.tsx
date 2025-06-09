
import { DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Package } from 'lucide-react';
import { formatTripDate } from '@/utils/dateUtils';

interface PackageLabelsDialogHeaderProps {
  tripDate: Date;
}

export function PackageLabelsDialogHeader({ tripDate }: PackageLabelsDialogHeaderProps) {
  const dateString = tripDate.toISOString().split('T')[0];
  const formattedDate = formatTripDate(dateString);
  
  return (
    <DialogHeader>
      <DialogTitle className="flex items-center gap-2">
        <Package className="h-5 w-5" />
        Gestión de Etiquetas - {formattedDate}
      </DialogTitle>
      <DialogDescription>
        Gestiona las etiquetas de las encomiendas del viaje
      </DialogDescription>
    </DialogHeader>
  );
}
