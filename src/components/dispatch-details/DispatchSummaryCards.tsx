
import { Card, CardContent } from '@/components/ui/card';
import { Package, Weight, Truck, DollarSign } from 'lucide-react';

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
  const formatCurrency = (value: number | null | undefined) => {
    if (!value) return '$0';
    return `$${value.toLocaleString('es-CO')}`;
  };

  return (
    <div className="grid grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-blue-500" />
            <div>
              <div className="text-2xl font-bold">{packageCount}</div>
              <div className="text-xs text-gray-600">Paquetes</div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Weight className="h-4 w-4 text-purple-500" />
            <div>
              <div className="text-2xl font-bold">{totalWeight} kg</div>
              <div className="text-xs text-gray-600">Peso Total</div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Truck className="h-4 w-4 text-orange-500" />
            <div>
              <div className="text-2xl font-bold">{formatCurrency(totalFreight)}</div>
              <div className="text-xs text-gray-600">Flete Total</div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-green-500" />
            <div>
              <div className="text-2xl font-bold text-green-700">{formatCurrency(totalAmountToCollect)}</div>
              <div className="text-xs text-gray-600">A Cobrar</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
