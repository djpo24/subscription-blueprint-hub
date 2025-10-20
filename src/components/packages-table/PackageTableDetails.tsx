
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/utils/currencyFormatter';

type Currency = 'COP' | 'AWG';

interface PackageTableDetailsProps {
  trackingNumber: string;
  amountToCollect: number | null;
  currency: Currency;
  freight: number | null;
  weight: number | null;
  discountApplied?: number | null;
}

export function PackageTableDetails({ 
  trackingNumber, 
  amountToCollect, 
  currency, 
  freight, 
  weight,
  discountApplied 
}: PackageTableDetailsProps) {
  const getCurrencyLabel = (curr: Currency) => {
    const labels = {
      'AWG': 'Florín Arubano',
      'COP': 'Peso Colombiano'
    };
    return labels[curr];
  };

  return (
    <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Detalles del Paquete</h3>
        <span className="text-sm text-gray-500">{trackingNumber}</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Moneda:</span>
            <Badge variant="outline" className="font-medium">
              {currency} - {getCurrencyLabel(currency)}
            </Badge>
          </div>
          
          {amountToCollect && amountToCollect > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">Monto a cobrar:</span>
              <span className="font-bold text-green-600">
                {formatCurrency(amountToCollect, currency)}
              </span>
            </div>
          )}
          
          {discountApplied && discountApplied > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">Descuento por puntos:</span>
              <span className="font-bold text-purple-600">
                -{formatCurrency(discountApplied, currency)}
              </span>
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          {freight && freight > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">Flete:</span>
              <span>
                {formatCurrency(freight, 'COP')}
              </span>
            </div>
          )}
          
          {weight && (
            <div className="flex justify-between">
              <span className="text-gray-600">Peso:</span>
              <span>{weight} kg</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
