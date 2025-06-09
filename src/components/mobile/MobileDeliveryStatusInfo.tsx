
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Package, User, MapPin, DollarSign, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import type { PackageInDispatch } from '@/types/dispatch';

interface MobileDeliveryStatusInfoProps {
  package: PackageInDispatch;
}

export function MobileDeliveryStatusInfo({ package: pkg }: MobileDeliveryStatusInfoProps) {
  const packageCurrency = pkg.currency || 'COP';
  
  // Obtener símbolo de divisa
  const getCurrencySymbol = (currency: string) => {
    const symbols = {
      'AWG': 'ƒ',
      'USD': '$',
      'COP': '$'
    };
    
    return symbols[currency as keyof typeof symbols] || '$';
  };

  const currencySymbol = getCurrencySymbol(packageCurrency);

  return (
    <div className="space-y-4">
      {/* Estado de entrega completada */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-green-800">
            <CheckCircle className="h-5 w-5" />
            Paquete Entregado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center p-4">
            <CheckCircle className="h-16 w-16 mx-auto text-green-600 mb-3" />
            <h3 className="text-lg font-semibold text-green-800 mb-2">
              ¡Entrega Completada!
            </h3>
            <p className="text-green-700 text-sm">
              Este paquete ya ha sido entregado y cobrado en su totalidad.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Información del paquete */}
      <Card className="border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-gray-800">
            <Package className="h-5 w-5" />
            Información del Paquete
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Tracking Number */}
          <div className="flex items-center gap-3">
            <Package className="h-4 w-4 text-gray-500" />
            <span className="font-semibold text-blue-600">{pkg.tracking_number}</span>
          </div>

          {/* Customer */}
          <div className="flex items-center gap-3">
            <User className="h-4 w-4 text-gray-500" />
            <span className="text-gray-700">{pkg.customers?.name || 'Cliente no especificado'}</span>
          </div>

          {/* Route */}
          <div className="flex items-center gap-3">
            <MapPin className="h-4 w-4 text-gray-500" />
            <span className="text-gray-700">{pkg.origin} → {pkg.destination}</span>
          </div>

          {/* Amount collected */}
          {pkg.amount_to_collect && pkg.amount_to_collect > 0 && (
            <div className="flex items-center gap-3">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span className="text-green-700 font-medium">
                Cobrado: {currencySymbol}{pkg.amount_to_collect.toLocaleString('es-CO')} {packageCurrency}
              </span>
            </div>
          )}

          {/* Delivery date */}
          {pkg.delivered_at && (
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-gray-700">
                Entregado: {format(new Date(pkg.delivered_at), 'dd/MM/yyyy HH:mm')}
              </span>
            </div>
          )}

          {/* Delivered by */}
          {pkg.delivered_by && (
            <div className="flex items-center gap-3">
              <User className="h-4 w-4 text-gray-500" />
              <span className="text-gray-700">
                Entregado por: {pkg.delivered_by}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Package description */}
      {pkg.description && (
        <Card className="border-gray-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-800">Descripción</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">{pkg.description}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
