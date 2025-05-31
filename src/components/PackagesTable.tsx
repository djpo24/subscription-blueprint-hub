
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { PackageActionsDropdown } from './PackageActionsDropdown';

interface Package {
  id: string;
  tracking_number: string;
  origin: string;
  destination: string;
  status: string;
  created_at: string;
  description: string;
  trip_id: string | null;
  customers?: {
    name: string;
    email: string;
  };
}

interface PackagesTableProps {
  packages: Package[];
  filteredPackages: Package[];
  isLoading: boolean;
  onUpdate?: () => void;
}

export function PackagesTable({ packages, filteredPackages, isLoading, onUpdate }: PackagesTableProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800";
      case "in_transit":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "delayed":
        return "bg-red-100 text-red-800";
      case "arrived":
        return "bg-purple-100 text-purple-800";
      case "warehouse":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "delivered":
        return "Entregado";
      case "in_transit":
        return "En Tránsito";
      case "pending":
        return "Pendiente";
      case "delayed":
        return "Retrasado";
      case "arrived":
        return "Llegado";
      case "warehouse":
        return "En Bodega";
      default:
        return status;
    }
  };

  const handleUpdate = () => {
    if (onUpdate) {
      onUpdate();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Encomiendas Recientes</CardTitle>
        <CardDescription>
          Últimas encomiendas registradas en el sistema
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="text-gray-500">Cargando...</div>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tracking</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Ruta</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPackages.map((pkg) => (
                <TableRow key={pkg.id} className="hover:bg-gray-50">
                  <TableCell className="font-medium">{pkg.tracking_number}</TableCell>
                  <TableCell>{pkg.customers?.name || 'N/A'}</TableCell>
                  <TableCell>
                    {pkg.status === 'warehouse' ? (
                      <span className="text-sm text-gray-500">En Bodega</span>
                    ) : (
                      <div className="flex items-center">
                        <span className="text-sm">{pkg.origin}</span>
                        <span className="mx-2">→</span>
                        <span className="text-sm">{pkg.destination}</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(pkg.status)}>
                      {getStatusLabel(pkg.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>{format(new Date(pkg.created_at), 'dd/MM/yyyy')}</TableCell>
                  <TableCell className="max-w-xs truncate">{pkg.description}</TableCell>
                  <TableCell>
                    <PackageActionsDropdown 
                      package={pkg} 
                      onUpdate={handleUpdate}
                    />
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
