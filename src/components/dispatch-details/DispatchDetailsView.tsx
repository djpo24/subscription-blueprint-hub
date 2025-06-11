import { useDispatchPackages, useDispatchRelations } from '@/hooks/useDispatchRelations';
import { useTripActions } from '@/hooks/useTripActions';
import { useDispatchReport } from '@/hooks/useDispatchReport';
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
  const { generateReport, isGenerating } = useDispatchReport();
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
  
  // Lógica simplificada para determinar cuándo se puede marcar en tránsito
  const canMarkAsInTransit = packages.some(pkg => 
    pkg.status === 'procesado' || pkg.status === 'despachado'
  ) && currentDispatch?.status !== 'en_transito';
  
  const canMarkAsArrived = currentDispatch?.status === 'en_transito';

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

  const handleGenerateReport = () => {
    generateReport(packages);
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
        onGenerateReport={handleGenerateReport}
        isGeneratingReport={isGenerating}
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
