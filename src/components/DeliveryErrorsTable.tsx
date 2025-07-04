
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useDeliveryErrors } from '@/hooks/useDeliveryErrors';
import { AlertTriangle, RefreshCw, Phone, Package, Calendar, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

export function DeliveryErrorsTable() {
  const { errorCustomers, isLoading, refetch } = useDeliveryErrors();

  console.log('🔄 DeliveryErrorsTable renderizado:', { 
    errorCustomersCount: errorCustomers.length, 
    isLoading 
  });

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
              Clientes que tuvieron errores al recibir notificaciones según logs del sistema
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refetch}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Actualizar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
              <div className="text-gray-500">Cargando errores de entrega...</div>
            </div>
          </div>
        ) : errorCustomers.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <AlertTriangle className="h-16 w-16 mx-auto mb-6 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No se encontraron errores de entrega</h3>
            <p className="text-sm">¡Todas las notificaciones se han enviado exitosamente!</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refetch}
              className="mt-4"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Verificar nuevamente
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center gap-4 text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500" />
                <span className="font-medium">Total de clientes afectados: {errorCustomers.length}</span>
              </div>
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-blue-500" />
                <span>Errores críticos: {errorCustomers.filter(c => c.failed_count >= 5).length}</span>
              </div>
            </div>

            <div className="border rounded-lg overflow-hidden">
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
                        <div className="text-sm text-gray-500 truncate">ID: {customer.customer_id}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3 text-gray-400" />
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
                          <Calendar className="h-3 w-3 text-gray-400" />
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
                          <div className="text-sm space-y-1">
                            {customer.packages.slice(0, 2).map((pkg, idx) => (
                              <div key={idx} className="truncate text-xs">
                                <span className="font-mono">{pkg.tracking_number}</span>
                                <br />
                                <span className="text-gray-500">→ {pkg.destination}</span>
                              </div>
                            ))}
                            {customer.packages.length > 2 && (
                              <div className="text-xs text-gray-400">
                                +{customer.packages.length - 2} más
                              </div>
                            )}
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
          </div>
        )}
      </CardContent>
    </Card>
  );
}
