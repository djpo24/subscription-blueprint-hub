
import { Button } from '@/components/ui/button';
import { Truck, Plane, FileText, Loader2 } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface DispatchDetailsHeaderProps {
  canMarkAsInTransit: boolean;
  canMarkAsArrived: boolean;
  onMarkAsInTransit: () => void;
  onMarkAsArrived: () => void;
  isMarkingAsInTransit: boolean;
  isMarkingAsArrived: boolean;
  hasPackages: boolean;
  onGenerateReport: () => void;
  isGeneratingReport: boolean;
}

export function DispatchDetailsHeader({
  canMarkAsInTransit,
  canMarkAsArrived,
  onMarkAsInTransit,
  onMarkAsArrived,
  isMarkingAsInTransit,
  isMarkingAsArrived,
  hasPackages,
  onGenerateReport,
  isGeneratingReport
}: DispatchDetailsHeaderProps) {
  const isMobile = useIsMobile();

  return (
    <div className={`flex ${isMobile ? 'flex-col gap-2' : 'justify-between items-center'}`}>
      <h2 className={`font-semibold ${isMobile ? 'text-lg' : 'text-xl'}`}>
        Detalles del Despacho
      </h2>
      
      <div className={`flex gap-2 ${isMobile ? 'flex-col' : ''}`}>
        {canMarkAsInTransit && (
          <Button
            onClick={onMarkAsInTransit}
            disabled={isMarkingAsInTransit || !hasPackages}
            className={`${isMobile ? 'w-full text-xs' : ''} bg-blue-600 hover:bg-blue-700`}
          >
            {isMarkingAsInTransit ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Truck className="h-4 w-4 mr-2" />
            )}
            {isMarkingAsInTransit ? 'Marcando...' : 'Marcar en Tránsito'}
          </Button>
        )}
        
        {canMarkAsArrived && (
          <Button
            onClick={onMarkAsArrived}
            disabled={isMarkingAsArrived || !hasPackages}
            className={`${isMobile ? 'w-full text-xs' : ''} bg-green-600 hover:bg-green-700`}
          >
            {isMarkingAsArrived ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Plane className="h-4 w-4 mr-2" />
            )}
            {isMarkingAsArrived ? 'Marcando...' : 'Marcar como Llegado'}
          </Button>
        )}
        
        <Button
          onClick={onGenerateReport}
          disabled={isGeneratingReport || !hasPackages}
          variant="outline"
          className={isMobile ? 'w-full text-xs' : ''}
        >
          {isGeneratingReport ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <FileText className="h-4 w-4 mr-2" />
          )}
          {isGeneratingReport ? 'Generando...' : 'Generar Reporte'}
        </Button>
      </div>
    </div>
  );
}
