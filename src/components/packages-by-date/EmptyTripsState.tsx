
import { Package } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface EmptyTripsStateProps {
  selectedDate: Date;
}

export function EmptyTripsState({ selectedDate }: EmptyTripsStateProps) {
  const formatDate = (date: Date) => {
    return format(date, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es });
  };

  return (
    <div className="text-center py-12">
      <Package className="h-16 w-16 mx-auto text-gray-300 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        No hay viajes programados
      </h3>
      <p className="text-gray-500">
        No se encontraron viajes para el {formatDate(selectedDate)}
      </p>
    </div>
  );
}
