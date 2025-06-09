
import { DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Truck } from 'lucide-react';
import { formatTripDate, formatDateDisplay } from '@/utils/dateUtils';
import { es } from 'date-fns/locale';

interface DispatchDialogHeaderProps {
  currentDate: Date;
  tripDate: Date;
}

export function DispatchDialogHeader({ currentDate, tripDate }: DispatchDialogHeaderProps) {
  const currentDateString = currentDate.toISOString().split('T')[0];
  const tripDateString = tripDate.toISOString().split('T')[0];
  
  const formattedCurrentDate = formatDateDisplay(currentDateString, "d 'de' MMMM 'de' yyyy");
  const formattedTripDate = formatDateDisplay(tripDateString, "d 'de' MMMM 'de' yyyy");
  
  return (
    <DialogHeader>
      <DialogTitle className="flex items-center gap-2">
        <Truck className="h-5 w-5" />
        Crear Despacho - {formattedCurrentDate}
      </DialogTitle>
      <div className="text-sm text-gray-600">
        Encomiendas del viaje: {formattedTripDate}
      </div>
    </DialogHeader>
  );
}
