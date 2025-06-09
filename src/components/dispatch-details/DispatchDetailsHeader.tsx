
import { Button } from '@/components/ui/button';
import { Truck, CheckCircle, FileText } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface DispatchDetailsHeaderProps {
  canMarkAsInTransit: boolean;
  canMarkAsArrived: boolean;
  onMarkAsInTransit: () => void;
  onMarkAsArrived: () => void;
  isMarkingAsInTransit: boolean;
  isMarkingAsArrived: boolean;
  hasPackages: boolean;
  onGenerateReport?: () => void;
  isGeneratingReport?: boolean;
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
  isGeneratingReport = false
}: DispatchDetailsHeaderProps) {
  const isMobile = useIsMobile();

  return (
    <div className={`flex ${isMobile ? 'flex-col gap-3' : 'flex-row justify-between items-center'}`}>
      <h3 className={`${isMobile ? 'text-lg' : 'text-xl'} font-semibold`}>
        Detalles del Despacho
      </h3>
      
      <div className={`flex ${isMobile ? 'flex-col gap-2' : 'gap-3'}`}>
        {hasPackages && onGenerateReport && (
          <Button
            onClick={onGenerateReport}
            disabled={isGeneratingReport}
            variant="outline"
            size={isMobile ? 'sm' : 'default'}
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            {isGeneratingReport ? 'Generando...' : 'Excel'}
          </Button>
        )}
        
        {canMarkAsInTransit && (
          <Button
            onClick={onMarkAsInTransit}
            disabled={isMarkingAsInTransit}
            size={isMobile ? 'sm' : 'default'}
            className="flex items-center gap-2"
          >
            <Truck className="h-4 w-4" />
            {isMarkingAsInTransit ? 'Marcando...' : 'Marcar en Tránsito'}
          </Button>
        )}
        
        {canMarkAsArrived && (
          <Button
            onClick={onMarkAsArrived}
            disabled={isMarkingAsArrived}
            variant="outline"
            size={isMobile ? 'sm' : 'default'}
            className="flex items-center gap-2"
          >
            <CheckCircle className="h-4 w-4" />
            {isMarkingAsArrived ? 'Marcando...' : 'Marcar como Llegado'}
          </Button>
        )}
      </div>
    </div>
  );
}
