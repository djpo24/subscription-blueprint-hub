
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package } from 'lucide-react';
import type { PackageInDispatch } from '@/types/dispatch';

interface MobilePackageInfoProps {
  package: PackageInDispatch;
}

export function MobilePackageInfo({ package: pkg }: MobilePackageInfoProps) {
  const requiresPayment = pkg.amount_to_collect && pkg.amount_to_collect > 0;
  const packageCurrency = pkg.currency || 'COP';
  
  // Logs detallados para debug
  console.log('📋 [MobilePackageInfo] Package data:', pkg);
  console.log('💰 [MobilePackageInfo] Package currency:', packageCurrency);
  console.log('💰 [MobilePackageInfo] Amount to collect:', pkg.amount_to_collect);
  console.log('💰 [MobilePackageInfo] Requires payment:', requiresPayment);
  
  // Obtener símbolo de divisa
  const getCurrencySymbol = (currency: string) => {
    const symbols = {
      'AWG': 'ƒ',
      'USD': '$',
      'COP': '$'
    };
    
    const symbol = symbols[currency as keyof typeof symbols] || '$';
    console.log('💱 [MobilePackageInfo] Currency symbol for', currency, ':', symbol);
    return symbol;
  };

  const currencySymbol = getCurrencySymbol(packageCurrency);

  const getCurrencyLabel = (currency: string) => {
    const labels = {
      'AWG': 'Florín (AWG)',
      'USD': 'Dólar (USD)',
      'COP': 'Peso (COP)'
    };
    
    const label = labels[currency as keyof typeof labels] || `${currency}`;
    console.log('🏷️ [MobilePackageInfo] Currency label for', currency, ':', label);
    return label;
  };

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
                  {getCurrencyLabel(packageCurrency)}
                </span>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
