
import { Package, Weight, DollarSign, CheckCircle } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { formatCurrency } from '@/utils/currencyFormatter';
import { formatWeight, formatFreight } from '@/utils/formatters';

type Currency = 'COP' | 'AWG';

interface TripPackageCardSummaryProps {
  packageCount: number;
  totalWeight: number;
  totalFreight: number;
  pendingAmountByCurrency: Record<Currency, number>;
  collectedAmountByCurrency: Record<Currency, number>;
}

export function TripPackageCardSummary({ 
  packageCount, 
  totalWeight, 
  totalFreight, 
  pendingAmountByCurrency,
  collectedAmountByCurrency
}: TripPackageCardSummaryProps) {
  const isMobile = useIsMobile();

  // Función para renderizar los montos por moneda
  const renderAmounts = (amountsByCurrency: Record<string, number>, showZero: boolean = false) => {
    const entries = Object.entries(amountsByCurrency).filter(([_, amount]) => amount > 0);
    
    if (entries.length === 0) {
      if (showZero) {
        return <div>{formatCurrency(0, 'COP')}</div>;
      }
      return <div className="text-gray-400">-</div>;
    }
    
    return entries.map(([currency, amount]) => (
      <div key={currency}>
        {formatCurrency(amount, currency as Currency)}
      </div>
    ));
  };

  // Asegurar que los datos existan con valores por defecto
  const safePendingAmounts = pendingAmountByCurrency || {};
  const safeCollectedAmounts = collectedAmountByCurrency || {};

  // Verificar si hay algún monto cobrado - fix TypeScript error by properly typing the values
  const hasPendingAmounts = Object.values(safePendingAmounts).some((amount: number) => amount > 0);
  const hasCollectedAmounts = Object.values(safeCollectedAmounts).some((amount: number) => amount > 0);

  console.log('📊 Summary rendering data:', {
    pendingAmountByCurrency,
    collectedAmountByCurrency,
    safePendingAmounts,
    safeCollectedAmounts,
    hasPendingAmounts,
    hasCollectedAmounts
  });

  return (
    <div className="w-full bg-white py-5 px-5">
      <div className={`${isMobile ? 'grid grid-cols-2 gap-2' : 'grid grid-cols-5 gap-4'}`}>
        <div className={`flex items-center gap-2 ${isMobile ? 'p-2' : 'p-3'} bg-blue-50 rounded-lg`}>
          <Package className="h-4 w-4 text-blue-600" />
          <div>
            <div className={`${isMobile ? 'text-sm' : 'text-lg'} font-bold text-blue-800`}>{packageCount}</div>
            <div className="text-xs text-blue-600">Paquetes</div>
          </div>
        </div>
        
        <div className={`flex items-center gap-2 ${isMobile ? 'p-2' : 'p-3'} bg-purple-50 rounded-lg`}>
          <Weight className="h-4 w-4 text-purple-600" />
          <div>
            <div className={`${isMobile ? 'text-sm' : 'text-lg'} font-bold text-purple-800`}>
              {formatWeight(totalWeight)} kg
            </div>
            <div className="text-xs text-purple-600">Peso</div>
          </div>
        </div>
        
        <div className={`flex items-center gap-2 ${isMobile ? 'p-2' : 'p-3'} bg-orange-50 rounded-lg`}>
          <DollarSign className="h-4 w-4 text-orange-600" />
          <div>
            <div className={`${isMobile ? 'text-xs' : 'text-sm'} font-bold text-orange-800`}>
              {formatCurrency(totalFreight, 'COP')}
            </div>
            <div className="text-xs text-orange-600">Flete</div>
          </div>
        </div>
        
        <div className={`flex items-center gap-2 ${isMobile ? 'p-2' : 'p-3'} bg-red-50 rounded-lg`}>
          <DollarSign className="h-4 w-4 text-red-600" />
          <div>
            <div className={`${isMobile ? 'text-xs' : 'text-sm'} font-bold text-red-800`}>
              {renderAmounts(safePendingAmounts, true)}
            </div>
            <div className="text-xs text-red-600">A Cobrar</div>
          </div>
        </div>

        <div className={`flex items-center gap-2 ${isMobile ? 'p-2' : 'p-3'} bg-green-50 rounded-lg`}>
          <CheckCircle className="h-4 w-4 text-green-600" />
          <div>
            <div className={`${isMobile ? 'text-xs' : 'text-sm'} font-bold text-green-800`}>
              {renderAmounts(safeCollectedAmounts)}
            </div>
            <div className="text-xs text-green-600">Cobrado</div>
          </div>
        </div>
      </div>
    </div>
  );
}
