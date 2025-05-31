
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useNotificationLog } from '@/hooks/useNotificationLog';
import { MessageCircle } from 'lucide-react';
import { format } from 'date-fns';

export function NotificationLogTable() {
  const { data: notifications = [], isLoading } = useNotificationLog();

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

  return (
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
                <TableHead>Tracking</TableHead>
                <TableHead>Mensaje</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Enviado</TableHead>
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
                  <TableCell className="font-medium">
                    {notification.packages?.tracking_number || 'N/A'}
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <div className="truncate" title={notification.message}>
                      {notification.message}
                    </div>
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
