
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, User, MapPin, Weight, DollarSign, Truck } from 'lucide-react';
import type { PackageInDispatch } from '@/types/dispatch';
import { getStatusColor, getStatusLabel, formatCurrency, canDeliverPackage } from './DispatchPackagesTableUtils';

interface DispatchPackagesMobileProps {
  packages: PackageInDispatch[];
  onDeliverPackage: (pkg: PackageInDispatch) => void;
  onPackageClick: (pkg: PackageInDispatch) => void;
  hasAnyActions?: boolean;
}

export function DispatchPackagesMobile({ 
  packages, 
  onDeliverPackage, 
  onPackageClick, 
  hasAnyActions = true 
}: DispatchPackagesMobileProps) {

  if (packages.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="h-16 w-16 mx-auto text-gray-300 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No hay paquetes en este despacho
        </h3>
        <p className="text-gray-500">
          Este despacho no contiene paquetes
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {packages.map((pkg) => (
        <Card 
          key={pkg.id} 
          className="border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => onPackageClick(pkg)}
        >
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-blue-500" />
                <span className="font-medium text-sm">{pkg.tracking_number}</span>
              </div>
              <Badge className={getStatusColor(pkg.status)} variant="secondary">
                {getStatusLabel(pkg.status)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            {/* Cliente y Ruta */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <User className="h-3 w-3 text-gray-500" />
                <span className="text-sm text-gray-700">{pkg.customers?.name || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-3 w-3 text-gray-500" />
                <span className="text-sm text-gray-700">
                  {pkg.origin} → {pkg.destination}
                </span>
              </div>
            </div>

            {/* Descripción */}
            {pkg.description && (
              <div className="p-2 bg-gray-50 rounded text-xs text-gray-600">
                {pkg.description}
              </div>
            )}

            {/* Detalles financieros y peso */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <Weight className="h-3 w-3 text-purple-500" />
                </div>
                <div className="text-xs font-medium">{pkg.weight ? `${pkg.weight} kg` : 'N/A'}</div>
                <div className="text-xs text-gray-500">Peso</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <Truck className="h-3 w-3 text-orange-500" />
                </div>
                <div className="text-xs font-medium">{formatCurrency(pkg.freight)}</div>
                <div className="text-xs text-gray-500">Flete</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <DollarSign className="h-3 w-3 text-green-500" />
                </div>
                <div className="text-xs font-medium text-green-700">{formatCurrency(pkg.amount_to_collect)}</div>
                <div className="text-xs text-gray-500">A Cobrar</div>
              </div>
            </div>

            {/* Botón de acción - Solo mostrar si hay acciones disponibles y el paquete está en destino */}
            {hasAnyActions && canDeliverPackage(pkg.status) && (
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation(); // Evitar que se abra el dialog de info
                  onDeliverPackage(pkg);
                }}
                className="w-full flex items-center gap-2 mt-3"
              >
                <Truck className="h-3 w-3" />
                Entregar
              </Button>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
