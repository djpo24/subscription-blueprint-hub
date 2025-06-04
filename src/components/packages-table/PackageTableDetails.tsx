
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/utils/currencyFormatter';

type Currency = 'COP' | 'AWG';

interface PackageTableDetailsProps {
  trackingNumber: string;
  amountToCollect: number | null;
  currency: Currency;
  freight: number | null;
  weight: number | null;
}

export function PackageTableDetails({ 
  trackingNumber, 
  amountToCollect, 
  currency, 
  freight, 
  weight 
}: PackageTableDetailsProps) {
  const getCurrencySymbol = (curr: Currency) => {
    return curr === 'AWG' ? 'ƒ' : '$';
  };

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
                {getCurrencySymbol(currency)}{amountToCollect.toLocaleString('es-CO')} {currency}
              </span>
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          {freight && freight > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">Flete:</span>
              <span>
                {getCurrencySymbol(currency)}{freight.toLocaleString('es-CO')} {currency}
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
