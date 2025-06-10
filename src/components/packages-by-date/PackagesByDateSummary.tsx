
import { useIsMobile } from '@/hooks/use-mobile';
import { formatCurrency } from '@/utils/currencyFormatter';
import { formatWeight, formatFreight } from '@/utils/formatters';
import { formatNumberWithThousandsSeparator } from '@/utils/numberFormatter';
import { Card, CardContent } from '@/components/ui/card';

interface PackagesByDateSummaryProps {
  totalPackages: number;
  totalWeight: number;
  totalFreight: number;
  amountsByCurrency: Record<string, number>;
}

export function PackagesByDateSummary({
  totalPackages,
  totalWeight,
  totalFreight,
  amountsByCurrency
}: PackagesByDateSummaryProps) {
  const isMobile = useIsMobile();

  if (totalPackages === 0) return null;

  // Determinar si hay múltiples monedas o solo COP
  const currencies = Object.keys(amountsByCurrency).filter(currency => amountsByCurrency[currency] > 0);
  const hasMultipleCurrencies = currencies.length > 1;
  const hasAnyAmountToCollect = currencies.some(currency => amountsByCurrency[currency] > 0);

  return (
    <div className={`${isMobile ? 'grid grid-cols-2 gap-3' : 'grid grid-cols-4 gap-4'} mt-4`}>
      <Card className="bg-gray-50 border-0 shadow-none">
        <CardContent className="p-4 text-center">
          <div className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold text-blue-600`}>{formatNumberWithThousandsSeparator(totalPackages)}</div>
          <div className="text-xs text-gray-600">Paquetes</div>
        </CardContent>
      </Card>
      
      <Card className="bg-gray-50 border-0 shadow-none">
        <CardContent className="p-4 text-center">
          <div className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold text-purple-600`}>{formatWeight(totalWeight)} kg</div>
          <div className="text-xs text-gray-600">Peso Total</div>
        </CardContent>
      </Card>
      
      <Card className="bg-gray-50 border-0 shadow-none">
        <CardContent className="p-4 text-center">
          <div className={`${isMobile ? 'text-sm' : 'text-2xl'} font-bold text-orange-600`}>{formatCurrency(totalFreight, 'COP')}</div>
          <div className="text-xs text-gray-600">Flete Total (COP)</div>
        </CardContent>
      </Card>
      
      <Card className="bg-gray-50 border-0 shadow-none">
        <CardContent className="p-4 text-center">
          {!hasAnyAmountToCollect ? (
            <>
              <div className={`${isMobile ? 'text-sm' : 'text-2xl'} font-bold text-green-600`}>$0</div>
              <div className="text-xs text-gray-600">A Cobrar</div>
            </>
          ) : hasMultipleCurrencies ? (
            <div className="space-y-1">
              {currencies.map((currency) => (
                <div key={currency}>
                  <div className={`${isMobile ? 'text-sm' : 'text-lg'} font-bold text-green-600`}>
                    {formatCurrency(amountsByCurrency[currency], currency as 'COP' | 'AWG')}
                  </div>
                </div>
              ))}
              <div className="text-xs text-gray-600">A Cobrar</div>
            </div>
          ) : (
            <>
              <div className={`${isMobile ? 'text-sm' : 'text-2xl'} font-bold text-green-600`}>
                {formatCurrency(amountsByCurrency[currencies[0]], currencies[0] as 'COP' | 'AWG')}
              </div>
              <div className="text-xs text-gray-600">A Cobrar</div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
