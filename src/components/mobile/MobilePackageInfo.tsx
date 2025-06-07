
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, MapPin, User, FileText, DollarSign, Coins, CheckCircle } from 'lucide-react';
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

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'Entregado';
      case 'en_destino':
        return 'En Destino';
      case 'procesado':
        return 'Procesado';
      case 'in_transit':
        return 'En Tránsito';
      case 'arrived':
        return 'Arribado';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  // Formatear descripción - máximo 2 items, si hay más, mostrar el tercero truncado
  const formatDescription = (description: string) => {
    if (!description) return 'N/A';
    
    const items = description.split(',').map(item => item.trim());
    if (items.length <= 2) {
      return items.join(', ');
    } else if (items.length === 3) {
      return `${items[0]}, ${items[1]}, ${items[2].substring(0, 4)}...`;
    } else {
      return `${items[0]}, ${items[1]}, ${items[2].substring(0, 4)}...`;
    }
  };

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-blue-800">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Encomiendas
          </div>
          <button className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded-full">
            Ver todos
          </button>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Stats Section */}
        <div className="flex justify-between items-center bg-white rounded-lg p-3 border">
          <div className="text-center">
            <div className="text-gray-400 text-sm">Cobrado</div>
            <div className="text-lg font-semibold">
              {requiresPayment ? currencySymbol + '0' : 'N/A'}
            </div>
          </div>
          <div className="text-center">
            <div className="text-gray-800 text-sm">Entregados</div>
            <div className="text-lg font-bold">1</div>
          </div>
        </div>

        {/* Package Details */}
        <div className="bg-white rounded-lg border">
          <div className="p-3 border-b">
            <h3 className="font-semibold text-gray-900">Detalles de entrega</h3>
          </div>
          
          <div className="p-3 space-y-3">
            {/* Package Number */}
            <div className="flex items-center gap-3">
              <Package className="h-4 w-4 text-gray-500" />
              <span className="font-semibold text-blue-600">{pkg.tracking_number}</span>
            </div>

            {/* Package Name */}
            <div className="flex items-center gap-3">
              <FileText className="h-4 w-4 text-gray-500" />
              <span className="font-medium">Encomienda {pkg.tracking_number}</span>
            </div>

            {/* Destination */}
            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-gray-500" />
              <span className="text-gray-700">{pkg.destination}</span>
            </div>

            {/* Customer Name */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-gray-500" />
                <span className="font-medium">{pkg.customers?.name || 'Cliente no especificado'}</span>
              </div>
              <button className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                Ver chat
              </button>
            </div>

            {/* Description */}
            <div className="pl-7">
              <span className="text-sm text-gray-600">
                {formatDescription(pkg.description)}
              </span>
            </div>

            {/* Amount to Collect */}
            {requiresPayment && (
              <div className="flex items-center gap-3">
                <DollarSign className="h-4 w-4 text-green-600" />
                <span className="font-medium text-green-700">
                  Monto a cobrar: {currencySymbol}{pkg.amount_to_collect?.toLocaleString('es-CO')}
                </span>
              </div>
            )}

            {/* Currency */}
            <div className="flex items-center gap-3">
              <Coins className="h-4 w-4 text-gray-500" />
              <span className="text-gray-700">{getCurrencyLabel(packageCurrency)}</span>
            </div>

            {/* Package Status */}
            <div className="flex items-center gap-3">
              <CheckCircle className="h-4 w-4 text-gray-500" />
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                pkg.status === 'delivered' ? 'bg-green-100 text-green-800' :
                pkg.status === 'en_destino' ? 'bg-blue-100 text-blue-800' :
                pkg.status === 'in_transit' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {getStatusLabel(pkg.status)}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
