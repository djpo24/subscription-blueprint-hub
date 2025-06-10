
import { Button } from '@/components/ui/button';
import { ArrowLeft, Truck, Package, Printer } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useIsMobile } from '@/hooks/use-mobile';

interface DispatchRelation {
  id: string;
  dispatch_date: string;
  total_packages: number;
  total_weight: number;
  total_freight: number;
  total_amount_to_collect: number;
  status: string;
  notes?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

interface PackagesByDateHeaderProps {
  selectedDate: Date;
  onBack: () => void;
  onCreateDispatch: () => void;
  onOpenLabelsDialog: () => void;
  dispatches: DispatchRelation[];
}

export function PackagesByDateHeader({
  selectedDate,
  onBack,
  onCreateDispatch,
  onOpenLabelsDialog,
  dispatches
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
            {dispatches.length > 0 && (
              <>
                <span>{dispatches.length} despachos</span>
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
