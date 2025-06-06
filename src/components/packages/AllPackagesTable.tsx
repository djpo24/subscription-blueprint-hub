
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Package, MapPin, Calendar, User } from 'lucide-react';
import { format } from 'date-fns';
import { useIsMobile } from '@/hooks/use-mobile';
import { usePackages } from '@/hooks/usePackages';

export function AllPackagesTable() {
  const isMobile = useIsMobile();
  const { data: packages = [], isLoading } = usePackages();

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

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="px-3 sm:px-6">
          <CardTitle className="text-lg sm:text-xl">Todas las Encomiendas</CardTitle>
          <CardDescription className="text-sm">
            Lista completa de todas las encomiendas registradas
          </CardDescription>
        </CardHeader>
        <CardContent className="px-3 sm:px-6">
          <div className="flex justify-center py-8">
            <div className="text-gray-500 text-sm">Cargando encomiendas...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Vista móvil con cards
  if (isMobile) {
    return (
      <Card>
        <CardHeader className="px-3 pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Package className="h-5 w-5" />
            Todas las Encomiendas
          </CardTitle>
          <CardDescription className="text-sm">
            Total: {packages.length} encomiendas
          </CardDescription>
        </CardHeader>
        <CardContent className="px-3 pb-3">
          <div className="space-y-3">
            {packages.map((pkg) => (
              <Card key={pkg.id} className="border border-gray-200">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
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
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">
                            {format(new Date(pkg.created_at), 'dd/MM/yyyy')}
                          </span>
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
                      <Badge className={`${getStatusColor(pkg.status)} text-xs`}>
                        {getStatusLabel(pkg.status)}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Vista desktop con tabla
  return (
    <Card>
      <CardHeader className="px-6">
        <CardTitle className="text-xl flex items-center gap-2">
          <Package className="h-5 w-5" />
          Todas las Encomiendas
        </CardTitle>
        <CardDescription>
          Lista completa de todas las encomiendas registradas - Total: {packages.length}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>N° Seguimiento</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Ruta</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Peso</TableHead>
              <TableHead>Flete</TableHead>
              <TableHead>A Cobrar</TableHead>
              <TableHead>Fecha</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {packages.map((pkg) => (
              <TableRow key={pkg.id} className="hover:bg-gray-50">
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
                  {format(new Date(pkg.created_at), 'dd/MM/yyyy')}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
