
import { useDispatchPackages, useDispatchRelations } from '@/hooks/useDispatchRelations';
import { useTripActions } from '@/hooks/useTripActions';
import { DispatchDetailsHeader } from './DispatchDetailsHeader';
import { DispatchSummaryCards } from './DispatchSummaryCards';
import { DispatchPackagesTable } from './DispatchPackagesTable';
import { useIsMobile } from '@/hooks/use-mobile';

interface DispatchDetailsViewProps {
  dispatchId: string | null;
}

export function DispatchDetailsView({ dispatchId }: DispatchDetailsViewProps) {
  const { data: packages = [], isLoading } = useDispatchPackages(dispatchId || '');
  const { data: dispatches = [] } = useDispatchRelations();
  const isMobile = useIsMobile();
  const { 
    markTripAsInTransit, 
    isMarkingAsInTransit,
    markTripAsArrived,
    isMarkingAsArrived
  } = useTripActions();

  if (!dispatchId) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Selecciona un despacho para ver los detalles</p>
      </div>
    );
  }

  const totals = packages.reduce(
    (acc, pkg) => ({
      weight: acc.weight + (pkg.weight || 0),
      freight: acc.freight + (pkg.freight || 0),
      amount_to_collect: acc.amount_to_collect + (pkg.amount_to_collect || 0)
    }),
    { weight: 0, freight: 0, amount_to_collect: 0 }
  );

  // Obtener información del despacho y del viaje
  const currentDispatch = dispatches.find(dispatch => dispatch.id === dispatchId);
  const firstPackage = packages[0];
  const canMarkAsInTransit = firstPackage && packages.some(pkg => pkg.status === 'procesado');
  const canMarkAsArrived = currentDispatch?.status === 'en_transito';

  const handleMarkAsInTransit = () => {
    if (firstPackage && firstPackage.trip_id) {
      console.log('🚀 Marcando viaje como en tránsito:', firstPackage.trip_id);
      markTripAsInTransit(firstPackage.trip_id);
    } else {
      console.error('❌ No se puede marcar como en tránsito: no hay trip_id');
    }
  };

  const handleMarkAsArrived = () => {
    if (firstPackage && firstPackage.trip_id) {
      console.log('🏁 Marcando viaje como llegado:', firstPackage.trip_id);
      markTripAsArrived(firstPackage.trip_id);
    } else {
      console.error('❌ No se puede marcar como llegado: no hay trip_id');
    }
  };

  if (isLoading) {
    return (
      <div className="py-8 text-center text-gray-500">
        Cargando detalles del despacho...
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${isMobile ? 'px-2' : 'space-y-6'}`}>
      <DispatchDetailsHeader
        canMarkAsInTransit={canMarkAsInTransit}
        canMarkAsArrived={canMarkAsArrived}
        onMarkAsInTransit={handleMarkAsInTransit}
        onMarkAsArrived={handleMarkAsArrived}
        isMarkingAsInTransit={isMarkingAsInTransit}
        isMarkingAsArrived={isMarkingAsArrived}
        hasPackages={packages.length > 0}
      />

      <DispatchSummaryCards
        packageCount={packages.length}
        totalWeight={totals.weight}
        totalFreight={totals.freight}
        totalAmountToCollect={totals.amount_to_collect}
      />

      <DispatchPackagesTable packages={packages} />
    </div>
  );
}
