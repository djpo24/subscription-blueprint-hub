
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Truck, Phone, Package, Calendar, MapPin, AlertCircle, RefreshCw, Weight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePendingDelivery } from '@/hooks/usePendingDelivery';
import { formatCurrency } from '@/utils/currencyFormatter';

export function PendingDeliveryTable() {
  const { data: pendingPackages, isLoading, error, refetch } = usePendingDelivery();

  const handleRetry = () => {
    console.log('🔄 Reintentando cargar paquetes pendientes de entrega...');
    refetch();
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: es,
      });
    } catch {
      return 'Fecha inválida';
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: { [key: string]: { label: string; variant: any } } = {
      'procesado': { label: 'Procesado', variant: 'secondary' },
      'en_transito': { label: 'En Tránsito', variant: 'default' },
      'en_destino': { label: 'En Destino', variant: 'outline' },
    };
    
    const statusInfo = statusMap[status] || { 
      label: status, 
      variant: 'outline' 
    };
    
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  const getDaysInTransit = (createdAt: string | null) => {
    if (!createdAt) return 0;
    try {
      const created = new Date(createdAt);
      const today = new Date();
      const diffTime = Math.abs(today.getTime() - created.getTime());
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    } catch {
      return 0;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Pendientes de Entrega
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-500">Cargando paquetes pendientes de entrega...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Pendientes de Entrega
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 font-medium mb-2">Error al cargar paquetes pendientes</p>
            <p className="text-sm text-gray-600 mb-4">
              {error instanceof Error ? error.message : 'Error desconocido'}
            </p>
            <Button 
              onClick={handleRetry}
              variant="outline"
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Reintentar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalToCollect = pendingPackages?.reduce((sum, pkg) => sum + (pkg.amount_to_collect || 0), 0) || 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Pendientes de Entrega
            {pendingPackages && pendingPackages.length > 0 && (
              <Badge variant="secondary" className="ml-2 bg-orange-100 text-orange-800">
                {pendingPackages.length}
              </Badge>
            )}
          </CardTitle>
          {pendingPackages && pendingPackages.length > 0 && (
            <div className="text-sm text-gray-600">
              Total a cobrar: <span className="font-medium text-orange-600">
                {formatCurrency(totalToCollect, 'COP')}
              </span>
            </div>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          Paquetes en tránsito o en destino pendientes de entrega
        </p>
      </CardHeader>
      <CardContent>
        {!pendingPackages || pendingPackages.length === 0 ? (
          <div className="text-center py-8">
            <Truck className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No hay paquetes pendientes de entrega</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Paquete</TableHead>
                  <TableHead>Ruta</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Peso</TableHead>
                  <TableHead className="text-right">A Cobrar</TableHead>
                  <TableHead>Días en Tránsito</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingPackages.map((pkg, index) => {
                  const daysInTransit = getDaysInTransit(pkg.created_at);
                  
                  return (
                    <TableRow 
                      key={`${pkg.package_id}-${index}`}
                      className="hover:bg-gray-50"
                    >
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{pkg.customer_name}</div>
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Phone className="h-3 w-3" />
                            {pkg.customer_phone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            <Package className="h-3 w-3 text-gray-500" />
                            <span className="text-sm font-mono">
                              {pkg.tracking_number}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 line-clamp-1">
                            {pkg.description}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-sm">
                            <MapPin className="h-3 w-3 text-gray-500" />
                            <span>{pkg.origin} → {pkg.destination}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(pkg.status)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Weight className="h-3 w-3 text-gray-500" />
                          <span className="text-sm">
                            {pkg.weight ? `${pkg.weight} kg` : 'N/A'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="font-medium text-orange-600">
                          {formatCurrency(pkg.amount_to_collect || 0, pkg.currency as 'COP' | 'AWG' || 'COP')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-gray-500" />
                          <Badge 
                            variant={daysInTransit >= 7 ? 'destructive' : daysInTransit >= 3 ? 'secondary' : 'outline'}
                            className="text-xs"
                          >
                            {daysInTransit} días
                          </Badge>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
