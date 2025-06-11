
import { Truck } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface DispatchesEmptyStateProps {
  selectedDate?: Date;
  isMobile?: boolean;
}

export function DispatchesEmptyState({ selectedDate, isMobile }: DispatchesEmptyStateProps) {
  return (
    <div className={`text-center ${isMobile ? 'py-8' : 'py-12'}`}>
      <Truck className={`mx-auto text-gray-300 mb-${isMobile ? '3' : '4'} ${isMobile ? 'h-12 w-12' : 'h-16 w-16'}`} />
      <h3 className={`font-medium text-gray-900 mb-2 ${isMobile ? 'text-base' : 'text-lg'}`}>
        No hay despachos
      </h3>
      <p className={`text-gray-500 ${isMobile ? 'text-sm' : ''}`}>
        {selectedDate 
          ? `No se encontraron despachos para ${isMobile ? 'la fecha seleccionada' : format(selectedDate, "d 'de' MMMM", { locale: es })}`
          : 'No se han creado despachos aún'
        }
      </p>
    </div>
  );
}
