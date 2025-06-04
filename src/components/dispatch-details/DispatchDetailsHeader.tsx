
import { Button } from '@/components/ui/button';
import { Truck, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

interface DispatchDetailsHeaderProps {
  canMarkAsInTransit: boolean;
  canMarkAsArrived: boolean;
  onMarkAsInTransit: () => void;
  onMarkAsArrived: () => void;
  isMarkingAsInTransit: boolean;
  isMarkingAsArrived: boolean;
  hasPackages: boolean;
}

export function DispatchDetailsHeader({
  canMarkAsInTransit,
  canMarkAsArrived,
  onMarkAsInTransit,
  onMarkAsArrived,
  isMarkingAsInTransit,
  isMarkingAsArrived,
  hasPackages
}: DispatchDetailsHeaderProps) {
  const queryClient = useQueryClient();

  const handleMarkAsInTransit = async () => {
    onMarkAsInTransit();
    // Forzar actualización inmediata después de 1 segundo
    setTimeout(() => {
      queryClient.refetchQueries({ queryKey: ['dispatch-relations'] });
      queryClient.refetchQueries({ queryKey: ['dispatch-packages'] });
    }, 1000);
  };

  const handleMarkAsArrived = async () => {
    onMarkAsArrived();
    // Forzar actualización inmediata después de 1 segundo
    setTimeout(() => {
      queryClient.refetchQueries({ queryKey: ['dispatch-relations'] });
      queryClient.refetchQueries({ queryKey: ['dispatch-packages'] });
    }, 1000);
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Truck className="h-5 w-5" />
        <h2 className="text-lg font-semibold">Detalles del Despacho</h2>
      </div>
      <div className="flex items-center gap-2">
        {canMarkAsInTransit && (
          <Button 
            size="sm" 
            variant="outline"
            onClick={handleMarkAsInTransit}
            disabled={isMarkingAsInTransit}
            className="flex items-center gap-1"
          >
            <Send className="h-3 w-3" />
            {isMarkingAsInTransit ? 'Marcando...' : 'Marcar en Tránsito'}
          </Button>
        )}
        {canMarkAsArrived && (
          <Button 
            size="sm" 
            variant="outline"
            onClick={handleMarkAsArrived}
            disabled={isMarkingAsArrived}
            className="flex items-center gap-1"
          >
            <CheckCircle className="h-3 w-3" />
            {isMarkingAsArrived ? 'Marcando...' : 'Llegado'}
          </Button>
        )}
        {!canMarkAsInTransit && !canMarkAsArrived && hasPackages && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <AlertCircle className="h-4 w-4" />
            No hay acciones disponibles para este despacho
          </div>
        )}
      </div>
    </div>
  );
}
