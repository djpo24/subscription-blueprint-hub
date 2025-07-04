
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useWhatsAppErrorLogs } from '@/hooks/useWhatsAppErrorLogs';
import { AlertTriangle, RefreshCw, Phone, Package, Calendar, Loader2, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';

export function WhatsAppErrorLogsTable() {
  const { errorLogs, isLoading, refetch } = useWhatsAppErrorLogs();

  console.log('🔄 WhatsAppErrorLogsTable renderizado:', { 
    errorLogsCount: errorLogs.length, 
    isLoading 
  });

  const getErrorSeverity = (errorMessage: string) => {
    if (!errorMessage) return 'bg-gray-100 text-gray-800';
    
    const message = errorMessage.toLowerCase();
    
    if (message.includes('131047') || message.includes('24 hours')) {
      return 'bg-yellow-100 text-yellow-800'; // 24-hour window
    }
    if (message.includes('131056') || message.includes('not registered')) {
      return 'bg-red-100 text-red-800'; // Not on WhatsApp
    }
    if (message.includes('190') || message.includes('access token')) {
      return 'bg-purple-100 text-purple-800'; // Token issues
    }
    if (message.includes('100') || message.includes('invalid')) {
      return 'bg-orange-100 text-orange-800'; // Invalid format
    }
    if (message.includes('133016') || message.includes('rate limit')) {
      return 'bg-blue-100 text-blue-800'; // Rate limit
    }
    
    return 'bg-red-100 text-red-800'; // General error
  };

  const getErrorTypeLabel = (errorMessage: string) => {
    if (!errorMessage) return 'Error desconocido';
    
    const message = errorMessage.toLowerCase();
    
    if (message.includes('131047') || message.includes('24 hours')) {
      return 'Ventana 24h';
    }
    if (message.includes('131056') || message.includes('not registered')) {
      return 'No registrado';
    }
    if (message.includes('190') || message.includes('access token')) {
      return 'Token expirado';
    }
    if (message.includes('100') || message.includes('invalid')) {
      return 'Formato inválido';
    }
    if (message.includes('133016') || message.includes('rate limit')) {
      return 'Límite excedido';
    }
    
    return 'Error API';
  };

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
      case 'manual_reply':
        return 'bg-cyan-100 text-cyan-800';
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
      case 'manual_reply':
        return 'Respuesta';
      default:
        return type;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Logs de Errores WhatsApp
            </CardTitle>
            <CardDescription>
              Registro detallado de todos los errores devueltos por Facebook/Meta WhatsApp API
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
              <div className="text-gray-500">Cargando logs de errores WhatsApp...</div>
            </div>
          </div>
        ) : errorLogs.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <AlertTriangle className="h-16 w-16 mx-auto mb-6 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No se encontraron errores de WhatsApp</h3>
            <p className="text-sm">¡Excelente! Todos los mensajes se han enviado correctamente.</p>
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
                <span className="font-medium">Total de errores: {errorLogs.length}</span>
              </div>
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-blue-500" />
                <span>Últimas 24h: {errorLogs.filter(log => {
                  const logTime = new Date(log.created_at);
                  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
                  return logTime > oneDayAgo;
                }).length}</span>
              </div>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Teléfono</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Error</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Mensaje</TableHead>
                    <TableHead>Paquete</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {errorLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <div className="font-medium">{log.customer_name}</div>
                        <div className="text-sm text-gray-500 truncate">ID: {log.customer_id || 'Sin registro'}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3 text-gray-400" />
                          <span className="text-sm">{log.customer_phone}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getNotificationTypeColor(log.notification_type)} variant="secondary">
                          {getNotificationTypeLabel(log.notification_type)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getErrorSeverity(log.error_message || '')} variant="secondary">
                          {getErrorTypeLabel(log.error_message || '')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="h-3 w-3 text-gray-400" />
                          {format(new Date(log.created_at), 'dd/MM/yyyy HH:mm')}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="truncate text-sm" title={log.error_message || ''}>
                          {log.error_message || 'Sin detalles del error'}
                        </div>
                        <div className="truncate text-xs text-gray-500 mt-1" title={log.message}>
                          Mensaje: {log.message.substring(0, 50)}...
                        </div>
                      </TableCell>
                      <TableCell>
                        {log.tracking_number ? (
                          <div className="text-sm">
                            <span className="font-mono">{log.tracking_number}</span>
                            <ExternalLink className="h-3 w-3 inline ml-1 text-gray-400" />
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">Sin paquete</span>
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
