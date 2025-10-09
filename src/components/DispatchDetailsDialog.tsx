import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog';
import { useDispatchPackages, useDispatchRelations } from '@/hooks/useDispatchRelations';
import { useTripActions } from '@/hooks/useTripActions';
import { useDispatchReport } from '@/hooks/useDispatchReport';
import { useTrips } from '@/hooks/useTrips';
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
  const { data: trips = [] } = useTrips();
  const { generateReport, isGenerating } = useDispatchReport();
  const isMobile = useIsMobile();
  const { 
    markTripAsInTransit, 
    isMarkingAsInTransit,
    markTripAsArrived,
    isMarkingAsArrived
  } = useTripActions();

  if (!dispatchId) return null;

  console.log('📦 [DispatchDetailsDialog] Packages loaded:', packages);

  // Calcular totales básicos desde los paquetes reales
  const totals = packages.reduce(
    (acc, pkg) => {
      console.log('📊 [DispatchDetailsDialog] Processing package for totals:', {
        id: pkg.id,
        weight: pkg.weight,
        freight: pkg.freight
      });
      
      return {
        weight: acc.weight + (pkg.weight ? Number(pkg.weight) : 0),
        freight: acc.freight + (pkg.freight ? Number(pkg.freight) : 0)
      };
    },
    { weight: 0, freight: 0 }
  );

  console.log('📊 [DispatchDetailsDialog] Calculated totals:', totals);

  // Calcular el total a cobrar agrupado por moneda
  const amountsByCurrency = packages.reduce((acc, pkg) => {
    if (pkg.amount_to_collect && pkg.amount_to_collect > 0) {
      const currency = parseCurrencyString(pkg.currency);
      const amount = Number(pkg.amount_to_collect);
      acc[currency] = (acc[currency] || 0) + amount;
      
      console.log('💰 [DispatchDetailsDialog] Adding amount:', {
        package: pkg.id,
        currency,
        amount,
        total: acc[currency]
      });
    }
    return acc;
  }, {} as Record<Currency, number>);

  console.log('💰 [DispatchDetailsDialog] Final amounts by currency:', amountsByCurrency);

  // Obtener información del despacho
  const currentDispatch = dispatches.find(dispatch => dispatch.id === dispatchId);
  
  // Lógica simplificada para determinar cuándo se puede marcar en tránsito
  const canMarkAsInTransit = packages.some(pkg => 
    pkg.status === 'procesado' || pkg.status === 'despachado'
  ) && currentDispatch?.status !== 'en_transito';
  
  const canMarkAsArrived = currentDispatch?.status === 'en_transito';

  const handleMarkAsInTransit = () => {
    if (dispatchId) {
      console.log('🚀 [DispatchDetailsDialog] Marcando despacho como en tránsito:', dispatchId);
      markTripAsInTransit({ dispatchId });
    } else {
      console.error('❌ No se puede marcar como en tránsito: falta dispatchId');
    }
  };

  const handleMarkAsArrived = () => {
    if (dispatchId) {
      console.log('🏁 [DispatchDetailsDialog] Marcando despacho como llegado:', dispatchId);
      markTripAsArrived(dispatchId);
    } else {
      console.error('❌ No se puede marcar como llegado: falta dispatchId');
    }
  };

  const handleGenerateReport = () => {
    // Obtener el nombre del viajero desde el primer paquete que tenga trip_id
    let travelerName: string | undefined;
    
    for (const pkg of packages) {
      if (pkg.trip_id) {
        const trip = trips.find(t => t.id === pkg.trip_id);
        if (trip?.travelers) {
          travelerName = `${trip.travelers.first_name} ${trip.travelers.last_name}`;
          break;
        }
      }
    }
    
    generateReport(packages, travelerName);
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
