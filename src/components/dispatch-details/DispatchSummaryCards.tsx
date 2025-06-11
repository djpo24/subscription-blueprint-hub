
import { Card, CardContent } from '@/components/ui/card';
import { Package, Weight, Truck, DollarSign } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { formatCurrency } from '@/utils/currencyFormatter';
import { formatWeight } from '@/utils/formatters';

interface DispatchSummaryCardsProps {
  packageCount: number;
  totalWeight: number;
  totalFreight: number;
  totalAmountToCollect: number;
}

export function DispatchSummaryCards({
  packageCount,
  totalWeight,
  totalFreight,
  totalAmountToCollect
}: DispatchSummaryCardsProps) {
  const isMobile = useIsMobile();

  return (
    <div className="w-full bg-white py-5 px-5">
      <div className={`${isMobile ? 'grid grid-cols-2 gap-2' : 'grid grid-cols-4 gap-4'}`}>
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
          <Truck className="h-4 w-4 text-orange-600" />
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
              {formatCurrency(totalAmountToCollect, 'COP')}
            </div>
            <div className="text-xs text-red-600">A Cobrar</div>
          </div>
        </div>
      </div>
    </div>
  );
}
