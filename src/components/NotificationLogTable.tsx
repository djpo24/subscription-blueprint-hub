
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useNotificationLog } from '@/hooks/useNotificationLog';
import { NotificationValidationDialog } from './NotificationValidationDialog';
import { MessageCircle, Settings, RotateCcw, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

export function NotificationLogTable() {
  const { data: notifications = [], isLoading } = useNotificationLog();
  const [selectedNotification, setSelectedNotification] = useState<any>(null);
  const [validationDialogOpen, setValidationDialogOpen] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "sent":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "sent":
        return "Enviado";
      case "pending":
        return "Pendiente";
      case "failed":
        return "Fallido";
      default:
        return status;
    }
  };

  const getNotificationTypeColor = (type: string) => {
    switch (type) {
      case "consulta_encomienda":
        return "bg-blue-100 text-blue-800";
      case "arrival_notification":
        return "bg-purple-100 text-purple-800";
      case "delivery_notification":
        return "bg-green-100 text-green-800";
      case "manual":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getNotificationTypeLabel = (type: string) => {
    switch (type) {
      case "consulta_encomienda":
        return "Consulta";
      case "arrival_notification":
        return "Llegada";
      case "delivery_notification":
        return "Entrega";
      case "manual":
        return "Manual";
      default:
        return type || "Manual";
    }
  };

  const handleValidateNotification = (notification: any) => {
    setSelectedNotification(notification);
    setValidationDialogOpen(true);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Log de Notificaciones
          </CardTitle>
          <CardDescription>
            Historial de notificaciones enviadas a los clientes
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="text-gray-500">Cargando notificaciones...</div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay notificaciones registradas</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Tracking</TableHead>
                  <TableHead>Mensaje</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Enviado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notifications.map((notification) => (
                  <TableRow key={notification.id}>
                    <TableCell>
                      {format(new Date(notification.created_at), 'dd/MM/yyyy HH:mm')}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{notification.customers?.name || 'N/A'}</div>
                        <div className="text-sm text-gray-500">{notification.customers?.phone || 'N/A'}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getNotificationTypeColor(notification.notification_type)} variant="secondary">
                        {getNotificationTypeLabel(notification.notification_type)}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {notification.packages?.tracking_number || 'N/A'}
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <div className="truncate" title={notification.message}>
                        {notification.message}
                      </div>
                      {notification.error_message && (
                        <div className="flex items-center gap-1 mt-1 text-xs text-red-600">
                          <AlertCircle className="h-3 w-3" />
                          <span className="truncate" title={notification.error_message}>
                            {notification.error_message}
                          </span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(notification.status)}>
                        {getStatusLabel(notification.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {notification.sent_at 
                        ? format(new Date(notification.sent_at), 'dd/MM/yyyy HH:mm')
                        : '-'
                      }
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleValidateNotification(notification)}
                          title="Validar parámetros y plantilla"
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                        
                        {notification.status === 'failed' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleValidateNotification(notification)}
                            title="Validar y reenviar notificación"
                            className="text-orange-600 hover:text-orange-700"
                          >
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {selectedNotification && (
        <NotificationValidationDialog
          notification={selectedNotification}
          open={validationDialogOpen}
          onOpenChange={setValidationDialogOpen}
        />
      )}
    </>
  );
}
