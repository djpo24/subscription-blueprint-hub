
import { ArrowLeft, Plus, FileText, Tags, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

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
  console.log('🔍 [PackagesByDateHeader] Component rendered:', {
    selectedDate: selectedDate.toISOString(),
    dispatchesCount: dispatches.length
  });

  const handleCreateDispatchClick = () => {
    console.log('🚀 [PackagesByDateHeader] Create Dispatch button clicked');
    onCreateDispatch();
  };

  const handleLabelsDialogClick = () => {
    console.log('🏷️ [PackagesByDateHeader] Labels Dialog button clicked');
    onOpenLabelsDialog();
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={onBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Volver al Calendario</span>
          <span className="sm:hidden">Volver</span>
        </Button>
        
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">
            Encomiendas del {format(selectedDate, 'dd MMMM yyyy', { locale: es })}
          </h2>
          {dispatches.length > 0 && (
            <p className="text-sm text-gray-600 mt-1">
              {dispatches.length} despacho{dispatches.length !== 1 ? 's' : ''} creado{dispatches.length !== 1 ? 's' : ''} para esta fecha
            </p>
          )}
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Button
          onClick={handleLabelsDialogClick}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <Tags className="h-4 w-4" />
          <span className="hidden sm:inline">Etiquetas</span>
        </Button>

        <Button
          onClick={handleCreateDispatchClick}
          size="sm"
          className="flex items-center gap-2"
        >
          <Send className="h-4 w-4" />
          <span className="hidden sm:inline">Crear Despacho</span>
          <span className="sm:hidden">Despacho</span>
        </Button>
      </div>
    </div>
  );
}
