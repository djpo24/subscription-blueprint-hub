
import { Button } from '@/components/ui/button';
import { CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ArrowLeft, Calendar, Truck } from 'lucide-react';

interface PackagesByDateHeaderProps {
  selectedDate: Date;
  totalPackages: number;
  totalTrips: number;
  dispatchCount: number;
  onBack: () => void;
  onCreateDispatch: () => void;
}

export function PackagesByDateHeader({
  selectedDate,
  totalPackages,
  totalTrips,
  dispatchCount,
  onBack,
  onCreateDispatch
}: PackagesByDateHeaderProps) {
  const formatDate = (date: Date) => {
    return format(date, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es });
  };

  return (
    <>
      <div className="flex items-center gap-2 mb-2">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Encomiendas del {formatDate(selectedDate)}
        </CardTitle>
      </div>
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          {totalPackages} encomienda{totalPackages !== 1 ? 's' : ''} en {totalTrips} viaje{totalTrips !== 1 ? 's' : ''}
          {dispatchCount > 0 && (
            <span className="ml-2 text-blue-600">
              • {dispatchCount} despacho{dispatchCount !== 1 ? 's' : ''} creado{dispatchCount !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        {totalPackages > 0 && (
          <Button
            onClick={onCreateDispatch}
            className="flex items-center gap-2"
          >
            <Truck className="h-4 w-4" />
            Crear Despacho
          </Button>
        )}
      </div>
    </>
  );
}
