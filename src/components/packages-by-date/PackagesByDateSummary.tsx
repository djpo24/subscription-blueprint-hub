
import { useIsMobile } from '@/hooks/use-mobile';

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

  const formatCurrency = (value: number) => {
    return `$${value.toLocaleString('es-CO')}`;
  };

  return (
    <div className={`${isMobile ? 'grid grid-cols-2 gap-3' : 'grid grid-cols-4 gap-4'} mt-4 p-4 bg-gray-50 rounded-lg`}>
      <div className="text-center">
        <div className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold text-blue-600`}>{totalPackages}</div>
        <div className="text-xs text-gray-600">Paquetes</div>
      </div>
      <div className="text-center">
        <div className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold text-purple-600`}>{totalWeight} kg</div>
        <div className="text-xs text-gray-600">Peso Total</div>
      </div>
      <div className="text-center">
        <div className={`${isMobile ? 'text-sm' : 'text-2xl'} font-bold text-orange-600`}>{formatCurrency(totalFreight)}</div>
        <div className="text-xs text-gray-600">Flete Total</div>
      </div>
      <div className="text-center">
        <div className={`${isMobile ? 'text-sm' : 'text-2xl'} font-bold text-green-600`}>{formatCurrency(totalAmountToCollect)}</div>
        <div className="text-xs text-gray-600">A Cobrar</div>
      </div>
    </div>
  );
}
