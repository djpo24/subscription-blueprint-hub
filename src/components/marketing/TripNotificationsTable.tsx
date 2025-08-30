
import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTripNotifications } from '@/hooks/useTripNotifications';
import { TripNotificationDetailsDialog } from './TripNotificationDetailsDialog';
import { Send, Eye, Trash2, Calendar, Plane } from 'lucide-react';
import { format } from 'date-fns';

interface TripNotificationsTableProps {
  notifications: any[];
  isLoading: boolean;
}

export function TripNotificationsTable({ notifications, isLoading }: TripNotificationsTableProps) {
  const { sendNotification, isSending } = useTripNotifications();
  const [selectedNotification, setSelectedNotification] = useState<any>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'sent':
        return 'Enviado';
      case 'draft':
        return 'Borrador';
      default:
        return status;
    }
  };

  const handleSendNotification = async (notificationId: string) => {
    try {
      await sendNotification(notificationId);
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };

  const handleViewDetails = (notification: any) => {
    setSelectedNotification(notification);
    setDetailsDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="text-gray-500">Cargando notificaciones...</div>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No hay notificaciones de viajes</p>
        <p className="text-sm mt-2">Crea tu primera notificación de viajes</p>
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Fecha</TableHead>
            <TableHead>Viajes</TableHead>
            <TableHead>Plantilla</TableHead>
            <TableHead>Fecha Límite</TableHead>
            <TableHead>Enviados</TableHead>
            <TableHead>Estado</TableHead>
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
                <div className="space-y-1">
                  {notification.outbound_trip && (
                    <div className="flex items-center gap-1 text-sm">
                      <Plane className="h-3 w-3" />
                      <span>{notification.outbound_trip.origin} → {notification.outbound_trip.destination}</span>
                      <span className="text-gray-500">
                        ({format(new Date(notification.outbound_trip.trip_date), 'dd/MM')})
                      </span>
                    </div>
                  )}
                  {notification.return_trip && (
                    <div className="flex items-center gap-1 text-sm">
                      <Plane className="h-3 w-3 rotate-180" />
                      <span>{notification.return_trip.origin} → {notification.return_trip.destination}</span>
                      <span className="text-gray-500">
                        ({format(new Date(notification.return_trip.trip_date), 'dd/MM')})
                      </span>
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  <div className="font-medium">{notification.template_name || 'N/A'}</div>
                  <div className="text-gray-500">{notification.template_language || 'es_CO'}</div>
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  <div>{format(new Date(notification.deadline_date), 'dd/MM/yyyy')}</div>
                  <div className="text-gray-500">{notification.deadline_time}</div>
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  <div className="text-green-600 font-medium">{notification.success_count || 0}</div>
                  {notification.failed_count > 0 && (
                    <div className="text-red-600">{notification.failed_count} fallidas</div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Badge className={getStatusColor(notification.status)}>
                  {getStatusLabel(notification.status)}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewDetails(notification)}
                    className="flex items-center gap-1"
                  >
                    <Eye className="h-4 w-4" />
                    Ver
                  </Button>
                  
                  {notification.status === 'draft' && (
                    <Button
                      size="sm"
                      onClick={() => handleSendNotification(notification.id)}
                      disabled={isSending}
                      className="flex items-center gap-1"
                    >
                      <Send className="h-4 w-4" />
                      {isSending ? 'Enviando...' : 'Enviar'}
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {selectedNotification && (
        <TripNotificationDetailsDialog
          isOpen={detailsDialogOpen}
          onOpenChange={setDetailsDialogOpen}
          tripNotificationId={selectedNotification.id}
          tripNotification={selectedNotification}
        />
      )}
    </>
  );
}
