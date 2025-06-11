
import { Card, CardContent } from '@/components/ui/card';
import { Package, Weight, Truck, DollarSign } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { formatWeight } from '@/utils/formatters';
import { formatNumberWithThousandsSeparator } from '@/utils/numberFormatter';
import { formatAmountToCollectWithCurrency, type Currency } from '@/utils/currencyFormatter';

interface DispatchSummaryCardsProps {
  packageCount: number;
  totalWeight: number;
  totalFreight: number;
  amountsByCurrency: Record<Currency, number>;
}

export function DispatchSummaryCards({
  packageCount,
  totalWeight,
  totalFreight,
  amountsByCurrency
}: DispatchSummaryCardsProps) {
  const isMobile = useIsMobile();

  console.log('💰 [DispatchSummaryCards] Amounts by currency:', amountsByCurrency);

  const formatFreightValue = (freight: number) => {
    if (!freight) return '$0';
    return `$${formatNumberWithThousandsSeparator(freight)}`;
  };

  // Renderizar los montos por moneda, igual que en la página de viajes
  const renderAmountToCollect = () => {
    const currencies = Object.keys(amountsByCurrency).filter(currency => amountsByCurrency[currency as Currency] > 0);
    const hasMultipleCurrencies = currencies.length > 1;
    const hasAnyAmountToCollect = currencies.some(currency => amountsByCurrency[currency as Currency] > 0);

    if (!hasAnyAmountToCollect) {
      return <div className={`${isMobile ? 'text-sm' : 'text-2xl'} font-bold text-green-700`}>---</div>;
    }

    if (hasMultipleCurrencies) {
      return (
        <div className="space-y-1">
          {currencies.map((currency) => (
            <div key={currency} className={`${isMobile ? 'text-sm' : 'text-lg'} font-bold text-green-700`}>
              {formatAmountToCollectWithCurrency(amountsByCurrency[currency as Currency], currency as Currency)}
            </div>
          ))}
        </div>
      );
    } else {
      return (
        <div className={`${isMobile ? 'text-sm' : 'text-2xl'} font-bold text-green-700`}>
          {formatAmountToCollectWithCurrency(amountsByCurrency[currencies[0] as Currency], currencies[0] as Currency)}
        </div>
      );
    }
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
              {renderAmountToCollect()}
              <div className="text-xs text-gray-600">A Cobrar</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
