
import { Package, Weight, DollarSign } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { formatCurrency } from '@/utils/currencyFormatter';

type Currency = 'COP' | 'AWG';

interface TripPackageCardSummaryProps {
  packageCount: number;
  totalsByCurrency: Record<Currency, { weight: number; freight: number; amount_to_collect: number }>;
}

export function TripPackageCardSummary({ packageCount, totalsByCurrency }: TripPackageCardSummaryProps) {
  const isMobile = useIsMobile();

  return (
    <div className={`${isMobile ? 'grid grid-cols-2 gap-2 mt-3' : 'grid grid-cols-4 gap-4 mt-4'}`}>
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
            {Object.values(totalsByCurrency).reduce((acc, curr) => acc + curr.weight, 0)} kg
          </div>
          <div className="text-xs text-purple-600">Peso</div>
        </div>
      </div>
      
      <div className={`flex items-center gap-2 ${isMobile ? 'p-2' : 'p-3'} bg-orange-50 rounded-lg`}>
        <DollarSign className="h-4 w-4 text-orange-600" />
        <div>
          <div className={`${isMobile ? 'text-xs' : 'text-sm'} font-bold text-orange-800`}>
            {Object.entries(totalsByCurrency).map(([currency, totals]) => (
              <div key={currency}>
                {formatCurrency(totals.freight, currency as Currency)}
              </div>
            ))}
          </div>
          <div className="text-xs text-orange-600">Flete</div>
        </div>
      </div>
      
      <div className={`flex items-center gap-2 ${isMobile ? 'p-2' : 'p-3'} bg-green-50 rounded-lg`}>
        <DollarSign className="h-4 w-4 text-green-600" />
        <div>
          <div className={`${isMobile ? 'text-xs' : 'text-sm'} font-bold text-green-800`}>
            {Object.entries(totalsByCurrency).map(([currency, totals]) => (
              <div key={currency}>
                {formatCurrency(totals.amount_to_collect, currency as Currency)}
              </div>
            ))}
          </div>
          <div className="text-xs text-green-600">A Cobrar</div>
        </div>
      </div>
    </div>
  );
}
