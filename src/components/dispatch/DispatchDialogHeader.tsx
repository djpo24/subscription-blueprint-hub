
import { DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Truck } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface DispatchDialogHeaderProps {
  currentDate: Date;
  tripDate: Date;
}

export function DispatchDialogHeader({ currentDate, tripDate }: DispatchDialogHeaderProps) {
  return (
    <DialogHeader>
      <DialogTitle className="flex items-center gap-2">
        <Truck className="h-5 w-5" />
        Crear Despacho - {format(currentDate, "d 'de' MMMM 'de' yyyy", { locale: es })}
      </DialogTitle>
      <div className="text-sm text-gray-600">
        Encomiendas del viaje: {format(tripDate, "d 'de' MMMM 'de' yyyy", { locale: es })}
      </div>
    </DialogHeader>
  );
}
