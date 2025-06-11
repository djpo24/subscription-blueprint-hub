import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, Truck, MapPin, User, Weight, DollarSign } from 'lucide-react';
import type { PackageInDispatch } from '@/types/dispatch';
import { DeliverPackageDialog } from './DeliverPackageDialog';
import { DispatchPackagesMobile } from './DispatchPackagesMobile';
import { useIsMobile } from '@/hooks/use-mobile';
import { formatAmountToCollectWithCurrency, parseCurrencyString, type Currency } from '@/utils/currencyFormatter';

interface DispatchPackagesTableProps {
  packages: PackageInDispatch[];
}

export function DispatchPackagesTable({ packages }: DispatchPackagesTableProps) {
  const [selectedPackage, setSelectedPackage] = useState<PackageInDispatch | null>(null);
  const [showDeliveryDialog, setShowDeliveryDialog] = useState(false);
  const isMobile = useIsMobile();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'en_destino':
        return 'bg-blue-100 text-blue-800';
      case 'procesado':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'Entregado';
      case 'en_destino':
        return 'En Destino';
      case 'procesado':
        return 'Procesado';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  const formatCurrency = (value: number | null | undefined) => {
    if (!value) return '$0';
    return `$${value.toLocaleString('es-CO')}`;
  };

  const formatAmountToCollectDisplay = (amount: number | null | undefined, currencyStr: string | null | undefined) => {
    if (!amount || amount === 0) return '---';
    
    const currency = parseCurrencyString(currencyStr);
    return formatAmountToCollectWithCurrency(amount, currency);
  };

  // Función para determinar si se puede entregar el paquete
  const canDeliverPackage = (pkg: PackageInDispatch) => {
    return pkg.status === 'en_destino';
  };

  const handleDeliverPackage = (pkg: PackageInDispatch) => {
    setSelectedPackage(pkg);
    setShowDeliveryDialog(true);
  };

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

  // Show mobile view on mobile devices
  if (isMobile) {
    return (
      <>
        <DispatchPackagesMobile 
          packages={packages} 
          onDeliverPackage={handleDeliverPackage}
        />
        <DeliverPackageDialog
          open={showDeliveryDialog}
          onOpenChange={setShowDeliveryDialog}
          package={selectedPackage}
        />
      </>
    );
  }

  // Desktop table view
  return (
    <>
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
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {packages.map((pkg) => (
              <TableRow key={pkg.id}>
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
                <TableCell>
                  {/* Solo mostrar botón de entrega si el paquete está en destino y no entregado */}
                  {canDeliverPackage(pkg) && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeliverPackage(pkg)}
                      className="flex items-center gap-1"
                    >
                      <Truck className="h-3 w-3" />
                      Entregar
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <DeliverPackageDialog
        open={showDeliveryDialog}
        onOpenChange={setShowDeliveryDialog}
        package={selectedPackage}
      />
    </>
  );
}
