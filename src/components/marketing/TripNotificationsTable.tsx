
import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useTripNotifications, TripNotification } from '@/hooks/useTripNotifications';
import { TripNotificationPanel } from './TripNotificationPanel';
import { formatDispatchDate, formatDateTime } from '@/utils/dateUtils';
import { Send, Eye, Calendar, Users, Clock } from 'lucide-react';

interface TripNotificationsTableProps {
  notifications: TripNotification[];
  isLoading: boolean;
}

export function TripNotificationsTable({ notifications, isLoading }: TripNotificationsTableProps) {
  const [selectedNotification, setSelectedNotification] = useState<TripNotification | null>(null);
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [viewNotification, setViewNotification] = useState<TripNotification | null>(null);
  const [showViewPanel, setShowViewPanel] = useState(false);
  const { sendNotification, isSending } = useTripNotifications();

  const handleSendClick = (notification: TripNotification) => {
    setSelectedNotification(notification);
    setShowSendDialog(true);
  };

  const handleViewClick = (notification: TripNotification) => {
    setViewNotification(notification);
    setShowViewPanel(true);
  };

  const handleConfirmSend = async () => {
    if (selectedNotification) {
      try {
        await sendNotification(selectedNotification.id);
        setShowSendDialog(false);
        setSelectedNotification(null);
      } catch (error) {
        console.error('Error sending notification:', error);
      }
    }
  };

  if (isLoading) {
    return <div>Cargando notificaciones...</div>;
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha Creación</TableHead>
              <TableHead>Viaje Ida</TableHead>
              <TableHead>Viaje Retorno</TableHead>
              <TableHead>Fecha Límite</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Estadísticas</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {notifications.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  No hay notificaciones de viaje registradas
                </TableCell>
              </TableRow>
            ) : (
              notifications.map((notification) => (
                <TableRow key={notification.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      {formatDispatchDate(notification.created_at)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">
                        {formatDispatchDate(notification.outbound_trip?.trip_date || '')}
                      </div>
                      <div className="text-sm text-gray-500">
                        {notification.outbound_trip?.origin} → {notification.outbound_trip?.destination}
                      </div>
                      {notification.outbound_trip?.flight_number && (
                        <div className="text-xs text-blue-600">
                          {notification.outbound_trip.flight_number}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">
                        {formatDispatchDate(notification.return_trip?.trip_date || '')}
                      </div>
                      <div className="text-sm text-gray-500">
                        {notification.return_trip?.origin} → {notification.return_trip?.destination}
                      </div>
                      {notification.return_trip?.flight_number && (
                        <div className="text-xs text-blue-600">
                          {notification.return_trip.flight_number}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-orange-500" />
                      <div>
                        <div className="font-medium">
                          {formatDispatchDate(notification.deadline_date)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {notification.deadline_time}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={notification.status === 'sent' ? 'default' : 'secondary'}>
                      {notification.status === 'sent' ? 'Enviada' : 'Borrador'}
                    </Badge>
                    {notification.sent_at && (
                      <div className="text-xs text-gray-500 mt-1">
                        {formatDateTime(notification.sent_at)}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {notification.status === 'sent' && (
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm">
                          <Users className="h-3 w-3 text-gray-400" />
                          Total: {notification.total_customers_sent}
                        </div>
                        <div className="text-xs text-green-600">
                          ✓ Exitosos: {notification.success_count}
                        </div>
                        {notification.failed_count > 0 && (
                          <div className="text-xs text-red-600">
                            ✗ Fallidos: {notification.failed_count}
                          </div>
                        )}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {notification.status === 'draft' && (
                        <Button
                          size="sm"
                          onClick={() => handleSendClick(notification)}
                          disabled={isSending}
                          className="flex items-center gap-1"
                        >
                          <Send className="h-3 w-3" />
                          Enviar
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex items-center gap-1"
                        onClick={() => handleViewClick(notification)}
                      >
                        <Eye className="h-3 w-3" />
                        Ver
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Dialog de confirmación para envío directo */}
      <AlertDialog open={showSendDialog} onOpenChange={setShowSendDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Envío de Notificaciones</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que quieres enviar esta notificación de viaje a todos los clientes?
              {selectedNotification && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-2">
                  <div><strong>Viaje de ida:</strong> {formatDispatchDate(selectedNotification.outbound_trip?.trip_date || '')}</div>
                  <div><strong>Viaje de retorno:</strong> {formatDispatchDate(selectedNotification.return_trip?.trip_date || '')}</div>
                  <div><strong>Fecha límite:</strong> {formatDispatchDate(selectedNotification.deadline_date)} a las {selectedNotification.deadline_time}</div>
                </div>
              )}
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmSend}
              disabled={isSending}
            >
              {isSending ? 'Enviando...' : 'Confirmar Envío'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Panel de visualización y envío controlado */}
      {viewNotification && (
        <TripNotificationPanel
          notification={viewNotification}
          isOpen={showViewPanel}
          onOpenChange={setShowViewPanel}
        />
      )}
    </>
  );
}
