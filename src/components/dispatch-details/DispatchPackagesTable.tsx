
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { User, MapPin } from 'lucide-react';

interface PackageInDispatch {
  id: string;
  tracking_number: string;
  origin: string;
  destination: string;
  status: string;
  description: string;
  weight: number | null;
  freight: number | null;
  amount_to_collect: number | null;
  trip_id: string | null;
  customers: {
    name: string;
    email: string;
  } | null;
}

interface DispatchPackagesTableProps {
  packages: PackageInDispatch[];
}

export function DispatchPackagesTable({ packages }: DispatchPackagesTableProps) {
  const formatCurrency = (value: number | null | undefined) => {
    if (!value) return '$0';
    return `$${value.toLocaleString('es-CO')}`;
  };

  const getPackageStatusColor = (status: string) => {
    switch (status) {
      case 'recibido':
        return 'bg-blue-50 text-blue-700';
      case 'bodega':
        return 'bg-gray-50 text-gray-700';
      case 'procesado':
        return 'bg-orange-50 text-orange-700';
      case 'transito':
        return 'bg-purple-50 text-purple-700';
      case 'en_destino':
        return 'bg-yellow-50 text-yellow-700';
      case 'delivered':
        return 'bg-green-50 text-green-700';
      default:
        return 'bg-gray-50 text-gray-700';
    }
  };

  const getPackageStatusLabel = (status: string) => {
    switch (status) {
      case 'recibido':
        return 'Recibido';
      case 'bodega':
        return 'Bodega';
      case 'procesado':
        return 'Procesado';
      case 'transito':
        return 'Tránsito';
      case 'en_destino':
        return 'En Destino';
      case 'delivered':
        return 'Entregado';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Paquetes en el Despacho</CardTitle>
      </CardHeader>
      <CardContent>
        {packages.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            No hay paquetes en este despacho
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tracking</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Ruta</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Peso</TableHead>
                <TableHead>Flete</TableHead>
                <TableHead>A Cobrar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {packages.map((pkg) => (
                <TableRow key={pkg.id}>
                  <TableCell className="font-medium">
                    {pkg.tracking_number}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      {pkg.customers?.name || 'Sin cliente'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3 w-3 text-gray-400" />
                      <span className="text-sm">
                        {pkg.origin} → {pkg.destination}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline"
                      className={`text-xs ${getPackageStatusColor(pkg.status)}`}
                    >
                      {getPackageStatusLabel(pkg.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-32 truncate text-sm">
                      {pkg.description}
                    </div>
                  </TableCell>
                  <TableCell>{pkg.weight || 0} kg</TableCell>
                  <TableCell>{formatCurrency(pkg.freight)}</TableCell>
                  <TableCell className="font-medium text-green-700">
                    {formatCurrency(pkg.amount_to_collect)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
