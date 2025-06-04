
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package } from 'lucide-react';
import type { PackageInDispatch } from '@/types/dispatch';

interface MobilePackageInfoProps {
  package: PackageInDispatch;
}

export function MobilePackageInfo({ package: pkg }: MobilePackageInfoProps) {
  const requiresPayment = pkg.amount_to_collect && pkg.amount_to_collect > 0;
  const packageCurrency = pkg.currency || 'COP';
  
  // Obtener símbolo de divisa
  const getCurrencySymbol = (currency: string) => {
    switch (currency) {
      case 'AWG': return 'ƒ';
      case 'USD': return '$';
      case 'COP': return '$';
      default: return '$';
    }
  };

  const currencySymbol = getCurrencySymbol(packageCurrency);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          {pkg.tracking_number}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 gap-3 text-sm">
          <div className="flex justify-between">
            <span className="font-medium text-gray-600">Cliente:</span>
            <span>{pkg.customers?.name || 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-gray-600">Destino:</span>
            <span>{pkg.destination}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-gray-600">Descripción:</span>
            <span className="text-right">{pkg.description}</span>
          </div>
          {requiresPayment && (
            <>
              <div className="flex justify-between border-t pt-2">
                <span className="font-medium text-gray-600">Monto a cobrar:</span>
                <span className="font-bold text-green-600">
                  {currencySymbol}{pkg.amount_to_collect?.toLocaleString('es-CO')} {packageCurrency}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-600">Moneda:</span>
                <span className="text-sm bg-blue-100 px-2 py-1 rounded">
                  {packageCurrency === 'AWG' ? 'Florín (AWG)' : 
                   packageCurrency === 'USD' ? 'Dólar (USD)' : 
                   'Peso (COP)'}
                </span>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
