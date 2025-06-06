
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, User, MapPin, FileText, DollarSign } from 'lucide-react';
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
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-800">
          <Package className="h-5 w-5" />
          Información del Paquete
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Tracking Number */}
        <div className="p-3 bg-white rounded-lg border">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">Número de Tracking</p>
            <p className="text-lg font-bold text-blue-600">{pkg.tracking_number}</p>
          </div>
        </div>

        {/* Información del Cliente */}
        <div className="grid grid-cols-1 gap-3">
          <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
            <User className="h-5 w-5 text-gray-500" />
            <div className="flex-1">
              <p className="text-sm text-gray-600">Cliente</p>
              <p className="font-medium">{pkg.customers?.name || 'N/A'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
            <MapPin className="h-5 w-5 text-gray-500" />
            <div className="flex-1">
              <p className="text-sm text-gray-600">Destino</p>
              <p className="font-medium">{pkg.destination}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
            <FileText className="h-5 w-5 text-gray-500" />
            <div className="flex-1">
              <p className="text-sm text-gray-600">Descripción</p>
              <p className="font-medium">{pkg.description}</p>
            </div>
          </div>

          {requiresPayment && (
            <>
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                <DollarSign className="h-5 w-5 text-green-600" />
                <div className="flex-1">
                  <p className="text-sm text-green-700">Monto a cobrar</p>
                  <p className="font-bold text-green-600 text-lg">
                    {currencySymbol}{pkg.amount_to_collect?.toLocaleString('es-CO')} {packageCurrency}
                  </p>
                </div>
              </div>
              
              <div className="p-3 bg-white rounded-lg border">
                <p className="text-sm text-gray-600 mb-1">Moneda</p>
                <div className="inline-block bg-blue-100 px-3 py-1 rounded-full">
                  <span className="text-sm font-medium text-blue-800">
                    {getCurrencyLabel(packageCurrency)}
                  </span>
                </div>
              </div>
            </>
          )}

          {/* Estado del paquete */}
          <div className="p-3 bg-white rounded-lg border">
            <p className="text-sm text-gray-600 mb-1">Estado</p>
            <div className="inline-block">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                pkg.status === 'entregado' ? 'bg-green-100 text-green-800' :
                pkg.status === 'en_destino' ? 'bg-blue-100 text-blue-800' :
                pkg.status === 'en_transito' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {pkg.status.replace('_', ' ').toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
