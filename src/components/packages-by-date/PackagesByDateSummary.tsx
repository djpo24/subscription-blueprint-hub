
import { useIsMobile } from '@/hooks/use-mobile';
import { formatCurrency } from '@/utils/currencyFormatter';
import { formatWeight, formatFreight } from '@/utils/formatters';
import { Card, CardContent } from '@/components/ui/card';

interface PackagesByDateSummaryProps {
  totalPackages: number;
  totalWeight: number;
  totalFreight: number;
  totalAmountToCollect: number;
}

export function PackagesByDateSummary({
  totalPackages,
  totalWeight,
  totalFreight,
  totalAmountToCollect
}: PackagesByDateSummaryProps) {
  const isMobile = useIsMobile();

  if (totalPackages === 0) return null;

  return (
    <div className={`${isMobile ? 'grid grid-cols-2 gap-3' : 'grid grid-cols-4 gap-4'} mt-4`}>
      <Card className="bg-gray-50">
        <CardContent className="p-4 text-center">
          <div className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold text-blue-600`}>{totalPackages}</div>
          <div className="text-xs text-gray-600">Paquetes</div>
        </CardContent>
      </Card>
      
      <Card className="bg-gray-50">
        <CardContent className="p-4 text-center">
          <div className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold text-purple-600`}>{formatWeight(totalWeight)} kg</div>
          <div className="text-xs text-gray-600">Peso Total</div>
        </CardContent>
      </Card>
      
      <Card className="bg-gray-50">
        <CardContent className="p-4 text-center">
          <div className={`${isMobile ? 'text-sm' : 'text-2xl'} font-bold text-orange-600`}>{formatCurrency(totalFreight, 'COP')}</div>
          <div className="text-xs text-gray-600">Flete Total (COP)</div>
        </CardContent>
      </Card>
      
      <Card className="bg-gray-50">
        <CardContent className="p-4 text-center">
          <div className={`${isMobile ? 'text-sm' : 'text-2xl'} font-bold text-green-600`}>{formatCurrency(totalAmountToCollect, 'COP')}</div>
          <div className="text-xs text-gray-600">A Cobrar</div>
        </CardContent>
      </Card>
    </div>
  );
}
