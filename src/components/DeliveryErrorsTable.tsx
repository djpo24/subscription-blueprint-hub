
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useDeliveryErrors } from '@/hooks/useDeliveryErrors';
import { AlertTriangle, RefreshCw, Phone, Package, Calendar } from 'lucide-react';
import { format } from 'date-fns';

export function DeliveryErrorsTable() {
  const { errorCustomers, isLoading, refetch } = useDeliveryErrors();

  const getNotificationTypeColor = (type: string) => {
    switch (type) {
      case 'arrival_notification':
        return 'bg-purple-100 text-purple-800';
      case 'trip_notification':
        return 'bg-blue-100 text-blue-800';
      case 'marketing_campaign':
        return 'bg-green-100 text-green-800';
      case 'manual':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-red-100 text-red-800';
    }
  };

  const getNotificationTypeLabel = (type: string) => {
    switch (type) {
      case 'arrival_notification':
        return 'Llegada';
      case 'trip_notification':
        return 'Viaje';
      case 'marketing_campaign':
        return 'Marketing';
      case 'manual':
        return 'Manual';
      default:
        return type;
    }
  };

  const getErrorSeverity = (failedCount: number) => {
    if (failedCount >= 5) return 'bg-red-100 text-red-800';
    if (failedCount >= 3) return 'bg-orange-100 text-orange-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Errores de Entrega WhatsApp
            </CardTitle>
            <CardDescription>
              Clientes que tuvieron errores al recibir notificaciones según logs de Facebook
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refetch}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="text-gray-500">Cargando errores de entrega...</div>
          </div>
        ) : errorCustomers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No se encontraron errores de entrega</p>
            <p className="text-sm mt-2">¡Todas las notificaciones se han enviado exitosamente!</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-4 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center gap-1">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <span className="font-medium">Total de clientes afectados: {errorCustomers.length}</span>
              </div>
              <div className="flex items-center gap-1">
                <Package className="h-4 w-4 text-blue-500" />
                <span>Errores críticos: {errorCustomers.filter(c => c.failed_count >= 5).length}</span>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Errores</TableHead>
                  <TableHead>Último Error</TableHead>
                  <TableHead>Mensaje de Error</TableHead>
                  <TableHead>Paquetes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {errorCustomers.map((customer, index) => (
                  <TableRow key={`${customer.customer_id}-${index}`}>
                    <TableCell>
                      <div className="font-medium">{customer.customer_name}</div>
                      <div className="text-sm text-gray-500">ID: {customer.customer_id}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        <span className="text-sm">{customer.customer_phone}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getNotificationTypeColor(customer.notification_type)} variant="secondary">
                        {getNotificationTypeLabel(customer.notification_type)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getErrorSeverity(customer.failed_count)} variant="secondary">
                        {customer.failed_count} error{customer.failed_count > 1 ? 'es' : ''}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(customer.last_error_date), 'dd/MM/yyyy HH:mm')}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <div className="truncate text-sm text-red-600" title={customer.error_message}>
                        {customer.error_message}
                      </div>
                    </TableCell>
                    <TableCell>
                      {customer.packages && customer.packages.length > 0 ? (
                        <div className="text-sm">
                          {customer.packages.map((pkg, idx) => (
                            <div key={idx} className="truncate">
                              {pkg.tracking_number} → {pkg.destination}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">Sin paquetes</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
