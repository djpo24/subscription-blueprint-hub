
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, MapPin, User, FileText, DollarSign, Coins, CheckCircle, ChevronDown, ChevronUp, Calendar } from 'lucide-react';
import { useDeliveredPackagesByUser } from '@/hooks/useDeliveredPackagesByUser';
import { format } from 'date-fns';
import type { PackageInDispatch } from '@/types/dispatch';

interface MobilePackageInfoProps {
  package: PackageInDispatch;
}

export function MobilePackageInfo({ package: pkg }: MobilePackageInfoProps) {
  const [showAllPackages, setShowAllPackages] = useState(false);
  const { data: deliveredPackages = [], isLoading: isLoadingDelivered } = useDeliveredPackagesByUser();
  
  const requiresPayment = pkg.amount_to_collect && pkg.amount_to_collect > 0;
  const packageCurrency = pkg.currency || 'COP';
  
  // Logs detallados para debug del cliente
  console.log('📋 [MobilePackageInfo] Package data:', pkg);
  console.log('👤 [MobilePackageInfo] Customer data:', pkg.customers);
  console.log('📧 [MobilePackageInfo] Customer name:', pkg.customers?.name);
  console.log('📧 [MobilePackageInfo] Customer email:', pkg.customers?.email);
  console.log('📞 [MobilePackageInfo] Customer phone:', pkg.customers?.phone);
  console.log('💰 [MobilePackageInfo] Package currency:', packageCurrency);
  console.log('💰 [MobilePackageInfo] Amount to collect:', pkg.amount_to_collect);
  console.log('💰 [MobilePackageInfo] Requires payment:', requiresPayment);
  console.log('📦 [MobilePackageInfo] Delivered packages count:', deliveredPackages.length);
  
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

  // Función mejorada para obtener el nombre del cliente
  const getCustomerName = () => {
    const customerName = pkg.customers?.name;
    console.log('🔍 [MobilePackageInfo] Getting customer name:', customerName);
    
    if (!customerName || customerName.trim() === '') {
      console.log('⚠️ [MobilePackageInfo] No customer name found, returning fallback');
      return 'Sin nombre asignado';
    }
    
    return customerName.trim();
  };

  const handleToggleAllPackages = () => {
    console.log('🔄 [MobilePackageInfo] Toggling all packages view:', !showAllPackages);
    setShowAllPackages(!showAllPackages);
  };

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-blue-800">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Encomiendas
          </div>
          <button 
            onClick={handleToggleAllPackages}
            className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded-full hover:bg-gray-300 transition-colors flex items-center gap-1"
          >
            {showAllPackages ? (
              <>
                Ocultar
                <ChevronUp className="h-3 w-3" />
              </>
            ) : (
              <>
                Ver todos
                <ChevronDown className="h-3 w-3" />
              </>
            )}
          </button>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {!showAllPackages ? (
          <>
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
                <div className="text-lg font-bold">{deliveredPackages.length}</div>
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

                {/* Customer Name - LÍNEA CORREGIDA */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="font-medium">{getCustomerName()}</span>
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
          </>
        ) : (
          /* Lista de todos los paquetes entregados */
          <div className="bg-white rounded-lg border">
            <div className="p-3 border-b">
              <h3 className="font-semibold text-gray-900">
                Todos los paquetes entregados ({deliveredPackages.length})
              </h3>
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              {isLoadingDelivered ? (
                <div className="p-4 text-center text-gray-500">
                  Cargando paquetes entregados...
                </div>
              ) : deliveredPackages.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No has entregado ningún paquete aún
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {deliveredPackages.map((deliveredPkg) => (
                    <div key={deliveredPkg.id} className="p-3 space-y-2">
                      {/* Tracking Number y Estado */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Package className="h-4 w-4 text-blue-600" />
                          <span className="font-semibold text-blue-600">{deliveredPkg.tracking_number}</span>
                        </div>
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                          Entregado
                        </span>
                      </div>

                      {/* Cliente */}
                      <div className="flex items-center gap-2">
                        <User className="h-3 w-3 text-gray-400" />
                        <span className="text-sm text-gray-700">{deliveredPkg.customers?.name || 'Sin nombre asignado'}</span>
                      </div>

                      {/* Ruta */}
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3 w-3 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {deliveredPkg.origin} → {deliveredPkg.destination}
                        </span>
                      </div>

                      {/* Fecha de entrega */}
                      {deliveredPkg.delivered_at && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {format(new Date(deliveredPkg.delivered_at), 'dd/MM/yyyy HH:mm')}
                          </span>
                        </div>
                      )}

                      {/* Monto a cobrar */}
                      {deliveredPkg.amount_to_collect && deliveredPkg.amount_to_collect > 0 && (
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-3 w-3 text-green-600" />
                          <span className="text-sm text-green-700">
                            {getCurrencySymbol(deliveredPkg.currency || 'COP')}
                            {deliveredPkg.amount_to_collect.toLocaleString('es-CO')}
                          </span>
                        </div>
                      )}

                      {/* Descripción */}
                      <div className="text-xs text-gray-500 pl-5">
                        {formatDescription(deliveredPkg.description)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
