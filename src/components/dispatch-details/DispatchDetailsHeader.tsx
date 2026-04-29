import { Button } from '@/components/ui/button';
import { Truck, Plane, FileText, Loader2, Undo2, RefreshCw } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface DispatchDetailsHeaderProps {
  canMarkAsInTransit: boolean;
  canMarkAsArrived: boolean;
  canRevert: boolean;
  dispatchStatus: string;
  onMarkAsInTransit: () => void;
  onMarkAsArrived: () => void;
  onRevert: () => void;
  isMarkingAsInTransit: boolean;
  isMarkingAsArrived: boolean;
  isReverting: boolean;
  hasPackages: boolean;
  onGenerateReport: () => void;
  isGeneratingReport: boolean;
  onReloadPackages?: () => void;
  isReloadingPackages?: boolean;
}

export function DispatchDetailsHeader({
  canMarkAsInTransit,
  canMarkAsArrived,
  canRevert,
  dispatchStatus,
  onMarkAsInTransit,
  onMarkAsArrived,
  onRevert,
  isMarkingAsInTransit,
  isMarkingAsArrived,
  isReverting,
  hasPackages,
  onGenerateReport,
  isGeneratingReport,
  onReloadPackages,
  isReloadingPackages = false,
}: DispatchDetailsHeaderProps) {
  const isMobile = useIsMobile();

  const revertLabel = dispatchStatus === 'llegado' ? 'Revertir a En Tránsito' : 'Revertir a Pendiente';

  return (
    <div className={`flex ${isMobile ? 'flex-col gap-2' : 'justify-between items-center'}`}>
      <h2 className={`font-semibold ${isMobile ? 'text-lg' : 'text-xl'}`}>
        Detalles del Despacho
      </h2>
      
      <div className={`flex gap-2 ${isMobile ? 'flex-col' : ''}`}>
        {canRevert && (
          <Button
            onClick={onRevert}
            disabled={isReverting}
            variant="outline"
            className={`${isMobile ? 'w-full text-xs' : ''} border-orange-500 text-orange-600 hover:bg-orange-50`}
          >
            {isReverting ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Undo2 className="h-4 w-4 mr-2" />
            )}
            {isReverting ? 'Revirtiendo...' : revertLabel}
          </Button>
        )}

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

        {dispatchStatus === 'llegado' && onReloadPackages && (
          <Button
            onClick={onReloadPackages}
            disabled={isReloadingPackages || !hasPackages}
            variant="outline"
            className={`${isMobile ? 'w-full text-xs' : ''} border-green-600 text-green-700 hover:bg-green-50`}
          >
            {isReloadingPackages ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            {isReloadingPackages ? 'Cargando...' : 'Cargar paquetes'}
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
