
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, Truck, MapPin, User, Weight, DollarSign } from 'lucide-react';
import type { PackageInDispatch } from '@/types/dispatch';
import { getStatusColor, getStatusLabel, formatCurrency, formatAmountToCollectDisplay, canDeliverPackage } from './DispatchPackagesTableUtils';

interface DispatchPackagesTableDesktopProps {
  packages: PackageInDispatch[];
  hasAnyActions: boolean;
  onDeliverPackage: (pkg: PackageInDispatch) => void;
  onPackageClick: (pkg: PackageInDispatch) => void;
}

export function DispatchPackagesTableDesktop({ 
  packages, 
  hasAnyActions, 
  onDeliverPackage, 
  onPackageClick 
}: DispatchPackagesTableDesktopProps) {
  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Número de Seguimiento</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Ruta</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Descripción</TableHead>
            <TableHead>Peso</TableHead>
            <TableHead>Flete</TableHead>
            <TableHead>A Cobrar</TableHead>
            {hasAnyActions && <TableHead>Acciones</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {packages.map((pkg) => (
            <TableRow 
              key={pkg.id} 
              className="cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => onPackageClick(pkg)}
            >
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-blue-500" />
                  {pkg.tracking_number}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  {pkg.customers?.name || 'N/A'}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">
                    {pkg.origin} → {pkg.destination}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <Badge className={getStatusColor(pkg.status)}>
                  {getStatusLabel(pkg.status)}
                </Badge>
              </TableCell>
              <TableCell className="max-w-xs truncate">
                {pkg.description}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Weight className="h-4 w-4 text-purple-500" />
                  {pkg.weight ? `${pkg.weight} kg` : 'N/A'}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-orange-500" />
                  {formatCurrency(pkg.freight)}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-500" />
                  <span className="font-medium text-green-700">
                    {formatAmountToCollectDisplay(pkg.amount_to_collect, pkg.currency)}
                  </span>
                </div>
              </TableCell>
              {hasAnyActions && (
                <TableCell>
                  {/* Solo mostrar botón de entrega si el paquete está en destino y no entregado */}
                  {canDeliverPackage(pkg.status) && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation(); // Evitar que se abra el dialog de info
                        onDeliverPackage(pkg);
                      }}
                      className="flex items-center gap-1"
                    >
                      <Truck className="h-3 w-3" />
                      Entregar
                    </Button>
                  )}
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
