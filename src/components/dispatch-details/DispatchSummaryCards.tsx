
import { Card, CardContent } from '@/components/ui/card';
import { Package, Weight, Truck, DollarSign } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { formatWeight, formatAmountToCollect } from '@/utils/formatters';
import { formatNumberWithThousandsSeparator } from '@/utils/numberFormatter';

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

  const formatFreightValue = (freight: number) => {
    if (!freight) return '$0';
    return `$${formatNumberWithThousandsSeparator(freight)}`;
  };

  const formatAmountToCollectValue = (amount: number) => {
    return formatAmountToCollect(amount, 'COP');
  };

  return (
    <div className={`${isMobile ? 'grid grid-cols-2 gap-2' : 'grid grid-cols-4 gap-4'}`}>
      <Card>
        <CardContent className={`${isMobile ? 'p-3' : 'p-4'}`}>
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-blue-500" />
            <div>
              <div className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold`}>{packageCount}</div>
              <div className="text-xs text-gray-600">Paquetes</div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className={`${isMobile ? 'p-3' : 'p-4'}`}>
          <div className="flex items-center gap-2">
            <Weight className="h-4 w-4 text-purple-500" />
            <div>
              <div className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold`}>{formatWeight(totalWeight)} kg</div>
              <div className="text-xs text-gray-600">Peso Total</div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className={`${isMobile ? 'p-3' : 'p-4'}`}>
          <div className="flex items-center gap-2">
            <Truck className="h-4 w-4 text-orange-500" />
            <div>
              <div className={`${isMobile ? 'text-sm' : 'text-2xl'} font-bold`}>{formatFreightValue(totalFreight)}</div>
              <div className="text-xs text-gray-600">Flete Total</div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className={`${isMobile ? 'p-3' : 'p-4'}`}>
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-green-500" />
            <div>
              <div className={`${isMobile ? 'text-sm' : 'text-2xl'} font-bold text-green-700`}>{formatAmountToCollectValue(totalAmountToCollect)}</div>
              <div className="text-xs text-gray-600">A Cobrar</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
