import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTripNotifications } from '@/hooks/useTripNotifications';
import { Send, Eye, Trash2, Calendar, Plane, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';

interface TripNotificationsTableProps {
  notifications: any[];
  isLoading: boolean;
}

export function TripNotificationsTable({ notifications, isLoading }: TripNotificationsTableProps) {
  const { sendNotification, isSending } = useTripNotifications();

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

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="text-gray-500">Cargando notificaciones...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="bg-red-50 border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-800">
            <AlertTriangle className="h-5 w-5" />
            Funcionalidad de Notificaciones DESHABILITADA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-700">
            Las notificaciones automáticas de viajes han sido completamente eliminadas.
            Solo está disponible la gestión manual de comunicaciones.
          </p>
        </CardContent>
      </Card>

      {notifications.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No hay notificaciones de viajes</p>
          <p className="text-sm mt-2">La funcionalidad automática ha sido eliminada</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Viajes</TableHead>
              <TableHead>Plantilla</TableHead>
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
                      </div>
                    )}
                    {notification.return_trip && (
                      <div className="flex items-center gap-1 text-sm">
                        <Plane className="h-3 w-3 rotate-180" />
                        <span>{notification.return_trip.origin} → {notification.return_trip.destination}</span>
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-red-600">
                    DESHABILITADO
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className="bg-red-100 text-red-800">
                    Eliminado
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button variant="outline" size="sm" disabled>
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    No Disponible
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}