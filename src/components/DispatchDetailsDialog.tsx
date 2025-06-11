import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog';
import { useDispatchPackages, useDispatchRelations } from '@/hooks/useDispatchRelations';
import { useTripActions } from '@/hooks/useTripActions';
import { useDispatchReport } from '@/hooks/useDispatchReport';
import { DispatchDetailsHeader } from './dispatch-details/DispatchDetailsHeader';
import { DispatchSummaryCards } from './dispatch-details/DispatchSummaryCards';
import { DispatchPackagesTable } from './dispatch-details/DispatchPackagesTable';
import { useIsMobile } from '@/hooks/use-mobile';
import { parseCurrencyString, type Currency } from '@/utils/currencyFormatter';

interface DispatchDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dispatchId: string | null;
}

export function DispatchDetailsDialog({ 
  open, 
  onOpenChange, 
  dispatchId 
}: DispatchDetailsDialogProps) {
  const { data: packages = [], isLoading } = useDispatchPackages(dispatchId || '');
  const { data: dispatches = [] } = useDispatchRelations();
  const { generateReport, isGenerating } = useDispatchReport();
  const isMobile = useIsMobile();
  const { 
    markTripAsInTransit, 
    isMarkingAsInTransit,
    markTripAsArrived,
    isMarkingAsArrived
  } = useTripActions();

  if (!dispatchId) return null;

  // Calcular totales básicos
  const totals = packages.reduce(
    (acc, pkg) => ({
      weight: acc.weight + (pkg.weight || 0),
      freight: acc.freight + (pkg.freight || 0)
    }),
    { weight: 0, freight: 0 }
  );

  // Calcular el total a cobrar agrupado por moneda (igual que en la página de viajes)
  const amountsByCurrency = packages.reduce((acc, pkg) => {
    if (pkg.amount_to_collect && pkg.amount_to_collect > 0) {
      const currency = parseCurrencyString(pkg.currency);
      acc[currency] = (acc[currency] || 0) + pkg.amount_to_collect;
    }
    return acc;
  }, {} as Record<Currency, number>);

  console.log('💰 [DispatchDetailsDialog] Amounts by currency:', amountsByCurrency);

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

  const handleGenerateReport = () => {
    generateReport(packages);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`${isMobile ? 'max-w-[95vw] max-h-[90vh] p-3' : 'max-w-6xl max-h-[80vh]'} overflow-y-auto`}>
        <DialogHeader className={isMobile ? 'pb-2' : ''}>
          <DispatchDetailsHeader
            canMarkAsInTransit={canMarkAsInTransit}
            canMarkAsArrived={canMarkAsArrived}
            onMarkAsInTransit={handleMarkAsInTransit}
            onMarkAsArrived={handleMarkAsArrived}
            isMarkingAsInTransit={isMarkingAsInTransit}
            isMarkingAsArrived={isMarkingAsArrived}
            hasPackages={packages.length > 0}
            onGenerateReport={handleGenerateReport}
            isGeneratingReport={isGenerating}
          />
        </DialogHeader>

        {isLoading ? (
          <div className="py-8 text-center text-gray-500">
            Cargando detalles del despacho...
          </div>
        ) : (
          <div className={`space-y-4 ${isMobile ? 'space-y-3' : 'space-y-6'}`}>
            <DispatchSummaryCards
              packageCount={packages.length}
              totalWeight={totals.weight}
              totalFreight={totals.freight}
              amountsByCurrency={amountsByCurrency}
            />

            <DispatchPackagesTable packages={packages} />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
