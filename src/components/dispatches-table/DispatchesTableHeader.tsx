
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Truck } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface DispatchesTableHeaderProps {
  selectedDate?: Date;
  dispatchCount: number;
  isMobile?: boolean;
}

export function DispatchesTableHeader({ selectedDate, dispatchCount, isMobile }: DispatchesTableHeaderProps) {
  if (isMobile) {
    return (
      <CardHeader className="px-3 pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Truck className="h-5 w-5" />
          Despachos
          {selectedDate && (
            <span className="text-sm font-normal text-gray-600 block mt-1">
              {format(selectedDate, "d 'de' MMMM", { locale: es })}
            </span>
          )}
        </CardTitle>
        <div className="text-sm text-gray-600">
          {dispatchCount} despacho{dispatchCount !== 1 ? 's' : ''}
        </div>
      </CardHeader>
    );
  }

  return (
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Truck className="h-5 w-5" />
        Despachos
        {selectedDate && (
          <span className="text-sm font-normal text-gray-600">
            - {format(selectedDate, "d 'de' MMMM 'de' yyyy", { locale: es })}
          </span>
        )}
      </CardTitle>
      <div className="text-sm text-gray-600">
        {dispatchCount} despacho{dispatchCount !== 1 ? 's' : ''} 
        {selectedDate ? ' en la fecha seleccionada' : ' en total'}
      </div>
    </CardHeader>
  );
}
