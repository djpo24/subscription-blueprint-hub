
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { User, MapPin, Printer } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { PackageWithRoute } from './PackageLabelsDialogTypes';

interface PackageLabelsDialogContentProps {
  packages: PackageWithRoute[];
  selectedPackageIds: Set<string>;
  onPackageToggle: (packageId: string) => void;
  onSelectAll: (packages: PackageWithRoute[]) => void;
  onPrintSingleLabel: (packageData: PackageWithRoute) => void;
  isPrintedTab: boolean;
}

export function PackageLabelsDialogContent({
  packages,
  selectedPackageIds,
  onPackageToggle,
  onSelectAll,
  onPrintSingleLabel,
  isPrintedTab
}: PackageLabelsDialogContentProps) {
  const isMobile = useIsMobile();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800";
      case "en_destino":
      case "arrived":
        return "bg-blue-100 text-blue-800";
      case "transito":
      case "in_transit":
        return "bg-yellow-100 text-yellow-800";
      case "procesado":
        return "bg-purple-100 text-purple-800";
      case "bodega":
        return "bg-gray-100 text-gray-800";
      case "recibido":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "delivered":
        return "Entregado";
      case "en_destino":
      case "arrived":
        return "En Destino";
      case "transito":
      case "in_transit":
        return "En Tránsito";
      case "procesado":
        return "Procesado";
      case "bodega":
        return "En Bodega";
      case "recibido":
        return "Recibido";
      default:
        return status;
    }
  };

  const formatCurrency = (amount: number | null, currency: string = 'COP') => {
    if (!amount) return '-';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (isMobile) {
    return (
      <div className="space-y-3">
        {packages.map((pkg) => (
          <Card key={pkg.id} className="border border-gray-200">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={selectedPackageIds.has(pkg.id)}
                      onCheckedChange={() => onPackageToggle(pkg.id)}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm mb-1">
                        {pkg.tracking_number}
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{pkg.customers?.name || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span className="text-sm">{pkg.origin}</span>
                        <span className="text-xs text-gray-400">→</span>
                        <span className="text-sm">{pkg.destination}</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        Peso: {pkg.weight || 0} kg | Flete: {formatCurrency(pkg.freight)}
                      </div>
                      {pkg.amount_to_collect && (
                        <div className="text-sm text-orange-600">
                          A cobrar: {formatCurrency(pkg.amount_to_collect, pkg.currency)}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge className={`${getStatusColor(pkg.status)} text-xs`}>
                      {getStatusLabel(pkg.status)}
                    </Badge>
                    <Button
                      size="sm"
                      onClick={() => onPrintSingleLabel(pkg)}
                      className="flex items-center gap-1"
                    >
                      <Printer className="h-3 w-3" />
                      <span className="text-xs">{isPrintedTab ? 'Re-imprimir' : 'Imprimir'}</span>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">
            <Checkbox
              checked={packages.length > 0 && packages.every(pkg => selectedPackageIds.has(pkg.id))}
              onCheckedChange={() => onSelectAll(packages)}
            />
          </TableHead>
          <TableHead>N° Seguimiento</TableHead>
          <TableHead>Cliente</TableHead>
          <TableHead>Ruta</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead>Peso</TableHead>
          <TableHead>Flete</TableHead>
          <TableHead>A Cobrar</TableHead>
          <TableHead>Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {packages.map((pkg) => (
          <TableRow key={pkg.id} className="hover:bg-gray-50">
            <TableCell>
              <Checkbox
                checked={selectedPackageIds.has(pkg.id)}
                onCheckedChange={() => onPackageToggle(pkg.id)}
              />
            </TableCell>
            <TableCell className="font-medium">
              {pkg.tracking_number}
            </TableCell>
            <TableCell>
              {pkg.customers?.name || 'N/A'}
            </TableCell>
            <TableCell>
              <div className="flex items-center">
                <span className="text-sm">{pkg.origin}</span>
                <span className="mx-2">→</span>
                <span className="text-sm">{pkg.destination}</span>
              </div>
            </TableCell>
            <TableCell>
              <Badge className={getStatusColor(pkg.status)}>
                {getStatusLabel(pkg.status)}
              </Badge>
            </TableCell>
            <TableCell>{pkg.weight || 0} kg</TableCell>
            <TableCell>{formatCurrency(pkg.freight)}</TableCell>
            <TableCell>
              {pkg.amount_to_collect ? 
                formatCurrency(pkg.amount_to_collect, pkg.currency) : 
                '-'
              }
            </TableCell>
            <TableCell>
              <Button
                size="sm"
                onClick={() => onPrintSingleLabel(pkg)}
                className="flex items-center gap-1"
              >
                <Printer className="h-3 w-3" />
                {isPrintedTab ? 'Re-imprimir' : 'Imprimir'}
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
