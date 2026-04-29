import { useDispatchPackages, useDispatchRelations } from '@/hooks/useDispatchRelations';
import { useTripActions } from '@/hooks/useTripActions';
import { useRevertDispatchStatus } from '@/hooks/useRevertDispatchStatus';
import { useDispatchReport } from '@/hooks/useDispatchReport';
import { useTrips } from '@/hooks/useTrips';
import { useReloadArrivalNotifications } from '@/hooks/useReloadArrivalNotifications';
import { DispatchDetailsHeader } from './DispatchDetailsHeader';
import { DispatchSummaryCards } from './DispatchSummaryCards';
import { DispatchPackagesTable } from './DispatchPackagesTable';
import { useIsMobile } from '@/hooks/use-mobile';
import { parseCurrencyString, type Currency } from '@/utils/currencyFormatter';

interface DispatchDetailsViewProps {
  dispatchId: string | null;
}

export function DispatchDetailsView({ dispatchId }: DispatchDetailsViewProps) {
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
  const { revertDispatchStatus, isReverting } = useRevertDispatchStatus();
  const { reloadArrivalNotifications, isReloadingNotifications } = useReloadArrivalNotifications();

  if (!dispatchId) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Selecciona un despacho para ver los detalles</p>
      </div>
    );
  }

  console.log('📦 [DispatchDetailsView] Packages loaded:', packages);
  console.log('📊 [DispatchDetailsView] Dispatch ID:', dispatchId);

  // Calcular totales básicos desde los paquetes reales
  const totals = packages.reduce(
    (acc, pkg) => {
      console.log('📊 Processing package for totals:', {
        id: pkg.id,
        weight: pkg.weight,
        freight: pkg.freight,
        amount_to_collect: pkg.amount_to_collect
      });
      
      return {
        weight: acc.weight + (pkg.weight ? Number(pkg.weight) : 0),
        freight: acc.freight + (pkg.freight ? Number(pkg.freight) : 0)
      };
    },
    { weight: 0, freight: 0 }
  );

  console.log('📊 [DispatchDetailsView] Calculated totals:', totals);

  // Calcular el total a cobrar agrupado por moneda
  const amountsByCurrency = packages.reduce((acc, pkg) => {
    if (pkg.amount_to_collect && pkg.amount_to_collect > 0) {
      const currency = parseCurrencyString(pkg.currency);
      const amount = Number(pkg.amount_to_collect);
      acc[currency] = (acc[currency] || 0) + amount;
      
      console.log('💰 [DispatchDetailsView] Adding amount:', {
        package: pkg.id,
        currency,
        amount,
        total: acc[currency]
      });
    }
    return acc;
  }, {} as Record<Currency, number>);

  console.log('💰 [DispatchDetailsView] Final amounts by currency:', amountsByCurrency);

  // Obtener información del despacho
  const currentDispatch = dispatches.find(dispatch => dispatch.id === dispatchId);
  
  // Lógica estricta: solo permitir transiciones válidas
  const dispatchStatus = currentDispatch?.status || 'pending';
  
  const canMarkAsInTransit = packages.some(pkg => 
    pkg.status === 'procesado' || pkg.status === 'despachado'
  ) && (dispatchStatus === 'pending' || dispatchStatus === 'procesado');
  
  const canMarkAsArrived = dispatchStatus === 'en_transito';
  
  // Permitir revertir si el despacho está en estado "llegado" o "en_transito"
  const canRevert = dispatchStatus === 'llegado' || dispatchStatus === 'en_transito';

  const handleMarkAsInTransit = () => {
    if (dispatchId) {
      console.log('🚀 [DispatchDetailsView] Marcando despacho como en tránsito:', dispatchId);
      markTripAsInTransit({ dispatchId });
    } else {
      console.error('❌ No se puede marcar como en tránsito: falta dispatchId');
    }
  };

  const handleMarkAsArrived = () => {
    if (dispatchId) {
      console.log('🏁 [DispatchDetailsView] Marcando despacho como llegado:', dispatchId);
      markTripAsArrived(dispatchId);
    } else {
      console.error('❌ No se puede marcar como llegado: falta dispatchId');
    }
  };

  const handleRevert = () => {
    if (dispatchId) {
      const targetStatus = dispatchStatus === 'llegado' ? 'en_transito' as const : 'pending' as const;
      revertDispatchStatus({ dispatchId, targetStatus });
    }
  };

  const handleReloadPackages = () => {
    if (dispatchId) {
      reloadArrivalNotifications(dispatchId);
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
        canRevert={canRevert}
        dispatchStatus={dispatchStatus}
        onMarkAsInTransit={handleMarkAsInTransit}
        onMarkAsArrived={handleMarkAsArrived}
        onRevert={handleRevert}
        isMarkingAsInTransit={isMarkingAsInTransit}
        isMarkingAsArrived={isMarkingAsArrived}
        isReverting={isReverting}
        hasPackages={packages.length > 0}
        onGenerateReport={handleGenerateReport}
        isGeneratingReport={isGenerating}
        onReloadPackages={handleReloadPackages}
        isReloadingPackages={isReloadingNotifications}
      />

      <DispatchSummaryCards
        packageCount={packages.length}
        totalWeight={totals.weight}
        totalFreight={totals.freight}
        amountsByCurrency={amountsByCurrency}
      />

      <DispatchPackagesTable packages={packages} />
    </div>
  );
}
