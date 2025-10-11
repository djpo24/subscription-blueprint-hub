import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, RefreshCw, MessageCircle } from 'lucide-react';
import { format } from 'date-fns';

export function FailedNotificationsPanel() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);

  // Query para obtener notificaciones fallidas
  const { data: failedNotifications = [], isLoading } = useQuery({
    queryKey: ['failed-notifications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notification_log')
        .select(`
          *,
          customers!customer_id (
            name,
            phone,
            whatsapp_number
          ),
          packages!package_id (
            tracking_number,
            destination
          )
        `)
        .eq('status', 'failed')
        .order('created_at', { ascending: false })
        .limit(500);

      if (error) {
        console.error('Error fetching failed notifications:', error);
        throw error;
      }

      return data || [];
    },
    refetchInterval: 10000,
  });

  // Mutation para reintentar mensajes
  const retryMutation = useMutation({
    mutationFn: async (notificationIds: string[]) => {
      console.log('🔄 Retrying notifications:', notificationIds);

      let successCount = 0;
      let failedCount = 0;

      for (const notificationId of notificationIds) {
        try {
          // Obtener la notificación
          const { data: notification, error: fetchError } = await supabase
            .from('notification_log')
            .select('*, customers!customer_id(phone, whatsapp_number)')
            .eq('id', notificationId)
            .single();

          if (fetchError || !notification) {
            console.error('Error fetching notification:', fetchError);
            failedCount++;
            continue;
          }

          // Actualizar estado a pending
          await supabase
            .from('notification_log')
            .update({ status: 'pending', error_message: null })
            .eq('id', notificationId);

          // Reintentar envío
          const phone = notification.customers?.whatsapp_number || notification.customers?.phone;
          if (!phone) {
            failedCount++;
            continue;
          }

          const { error: sendError } = await supabase.functions.invoke('send-whatsapp-notification', {
            body: {
              notificationId: notification.id,
              phone: phone,
              message: notification.message,
              customerId: notification.customer_id
            }
          });

          if (sendError) {
            console.error('Error sending notification:', sendError);
            await supabase
              .from('notification_log')
              .update({ 
                status: 'failed', 
                error_message: sendError.message 
              })
              .eq('id', notificationId);
            failedCount++;
          } else {
            successCount++;
          }
        } catch (error) {
          console.error('Error processing notification:', error);
          failedCount++;
        }
      }

      return { successCount, failedCount };
    },
    onSuccess: (result) => {
      toast({
        title: "Reintento completado",
        description: `${result.successCount} enviados, ${result.failedCount} fallidos`,
      });
      queryClient.invalidateQueries({ queryKey: ['failed-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notification-log'] });
      setSelectedNotifications([]);
    },
    onError: (error: any) => {
      toast({
        title: "Error al reintentar",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedNotifications(failedNotifications.map(n => n.id));
    } else {
      setSelectedNotifications([]);
    }
  };

  const handleSelectNotification = (notificationId: string, checked: boolean) => {
    if (checked) {
      setSelectedNotifications([...selectedNotifications, notificationId]);
    } else {
      setSelectedNotifications(selectedNotifications.filter(id => id !== notificationId));
    }
  };

  const handleRetry = () => {
    if (selectedNotifications.length === 0) return;
    retryMutation.mutate(selectedNotifications);
  };

  const getNotificationTypeLabel = (type: string) => {
    switch (type) {
      case 'consulta_encomienda': return 'Consulta';
      case 'arrival_notification': return 'Llegada';
      case 'delivery_notification': return 'Entrega';
      case 'manual': return 'Manual';
      case 'trip_notification': return 'Viaje';
      case 'marketing_campaign': return 'Marketing';
      case 'manual_reply': return 'Respuesta';
      default: return type || 'Manual';
    }
  };

  const getNotificationTypeColor = (type: string) => {
    switch (type) {
      case 'consulta_encomienda': return 'bg-blue-100 text-blue-800';
      case 'arrival_notification': return 'bg-purple-100 text-purple-800';
      case 'delivery_notification': return 'bg-green-100 text-green-800';
      case 'trip_notification': return 'bg-blue-100 text-blue-800';
      case 'marketing_campaign': return 'bg-green-100 text-green-800';
      case 'manual': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-red-500" />
          Mensajes Fallidos
        </CardTitle>
        <CardDescription>
          Gestiona y reintenta los mensajes que no pudieron ser enviados
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        ) : failedNotifications.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
            <p className="text-gray-500">No hay mensajes fallidos</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedNotifications.length === failedNotifications.length}
                    onCheckedChange={handleSelectAll}
                  />
                  <span className="text-sm text-gray-600">
                    {selectedNotifications.length} de {failedNotifications.length} seleccionados
                  </span>
                </div>
                <Badge variant="destructive" className="text-lg">
                  {failedNotifications.length} Fallidos
                </Badge>
              </div>
              <Button
                onClick={handleRetry}
                disabled={selectedNotifications.length === 0 || retryMutation.isPending}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${retryMutation.isPending ? 'animate-spin' : ''}`} />
                {retryMutation.isPending ? 'Reenviando...' : 'Reintentar Seleccionados'}
              </Button>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Tracking</TableHead>
                  <TableHead>Error</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {failedNotifications.map((notification) => (
                  <TableRow key={notification.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedNotifications.includes(notification.id)}
                        onCheckedChange={(checked) => 
                          handleSelectNotification(notification.id, checked as boolean)
                        }
                      />
                    </TableCell>
                    <TableCell className="text-sm">
                      {format(new Date(notification.created_at), 'dd/MM/yyyy HH:mm')}
                    </TableCell>
                    <TableCell className="font-medium">
                      {notification.customers?.name || 'N/A'}
                    </TableCell>
                    <TableCell>
                      {notification.customers?.whatsapp_number || notification.customers?.phone || 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        className={getNotificationTypeColor(notification.notification_type)} 
                        variant="secondary"
                      >
                        {getNotificationTypeLabel(notification.notification_type)}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {notification.packages?.tracking_number || 'N/A'}
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-red-600 truncate" title={notification.error_message || ''}>
                          {notification.error_message || 'Error desconocido'}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </>
        )}
      </CardContent>
    </Card>
  );
}
