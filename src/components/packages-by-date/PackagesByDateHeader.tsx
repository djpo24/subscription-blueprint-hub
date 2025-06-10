
import { Button } from '@/components/ui/button';
import { ArrowLeft, Truck, Package, Printer } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useIsMobile } from '@/hooks/use-mobile';

interface PackagesByDateHeaderProps {
  selectedDate: Date;
  totalPackages: number;
  totalTrips: number;
  dispatchCount: number;
  onBack: () => void;
  onCreateDispatch: () => void;
  onOpenLabelsDialog: () => void;
}

export function PackagesByDateHeader({
  selectedDate,
  totalPackages,
  totalTrips,
  dispatchCount,
  onBack,
  onCreateDispatch,
  onOpenLabelsDialog
}: PackagesByDateHeaderProps) {
  const isMobile = useIsMobile();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={onBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className={isMobile ? 'text-xs' : ''}>Volver al Calendario</span>
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">
            Encomiendas - {format(selectedDate, "d 'de' MMMM 'de' yyyy", { locale: es })}
          </h2>
          <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
            <span className="flex items-center gap-1">
              <Package className="h-4 w-4" />
              {totalPackages} encomiendas
            </span>
            <span>•</span>
            <span>{totalTrips} viajes</span>
            {dispatchCount > 0 && (
              <>
                <span>•</span>
                <span>{dispatchCount} despachos</span>
              </>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={onOpenLabelsDialog}
            className="flex items-center gap-2"
            variant="outline"
          >
            <Printer className="h-4 w-4" />
            <span className={isMobile ? 'text-xs' : ''}>Gestionar Etiquetas</span>
          </Button>

          <Button
            onClick={onCreateDispatch}
            className="flex items-center gap-2"
          >
            <Truck className="h-4 w-4" />
            <span className={isMobile ? 'text-xs' : ''}>Crear Despacho</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
