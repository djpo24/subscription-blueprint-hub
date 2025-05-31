
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface FlightData {
  id: string;
  flight_number: string;
  status: string;
  actual_arrival: string | null;
  has_landed: boolean;
  notification_sent: boolean;
  departure_airport: string;
  arrival_airport: string;
}

export function useFlightNotifications() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch flight data that needs processing
  const { data: pendingFlights = [], isLoading } = useQuery({
    queryKey: ['pending-flight-notifications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('flight_data')
        .select('*')
        .eq('has_landed', true)
        .eq('notification_sent', false);
      
      if (error) throw error;
      return data as FlightData[];
    },
    refetchInterval: 30000, // Check every 30 seconds
  });

  // Mutation to process notifications with WhatsApp integration
  const processNotificationsMutation = useMutation({
    mutationFn: async () => {
      console.log('Iniciando procesamiento de notificaciones...');
      
      // First, run the database function to create notification records
      const { error } = await supabase.rpc('process_arrival_notifications');
      if (error) throw error;

      // Get all pending notifications that were just created
      const { data: pendingNotifications, error: fetchError } = await supabase
        .from('notification_log')
        .select(`
          id,
          message,
          customers (
            phone,
            whatsapp_number,
            name
          ),
          packages (
            tracking_number
          )
        `)
        .eq('status', 'pending')
        .eq('notification_type', 'arrival');

      if (fetchError) throw fetchError;

      console.log('Notificaciones pendientes encontradas:', pendingNotifications?.length || 0);

      // Send WhatsApp notifications for each pending notification
      if (pendingNotifications && pendingNotifications.length > 0) {
        const notificationPromises = pendingNotifications.map(async (notification: any) => {
          const phone = notification.customers?.whatsapp_number || notification.customers?.phone;
          
          if (!phone) {
            console.log('Sin número de teléfono para:', notification.customers?.name);
            return;
          }

          try {
            const response = await supabase.functions.invoke('send-whatsapp-notification', {
              body: {
                notificationId: notification.id,
                phone: phone,
                message: notification.message
              }
            });

            if (response.error) {
              console.error('Error enviando notificación:', response.error);
            } else {
              console.log('Notificación enviada exitosamente:', notification.id);
            }
          } catch (error) {
            console.error('Error en edge function:', error);
          }
        });

        await Promise.all(notificationPromises);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-flight-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['packages'] });
      queryClient.invalidateQueries({ queryKey: ['notification-log'] });
      toast({
        title: "Notificaciones procesadas",
        description: "Se han enviado las notificaciones de llegada por WhatsApp",
      });
    },
    onError: (error: any) => {
      console.error('Error processing notifications:', error);
      toast({
        title: "Error",
        description: "No se pudieron procesar las notificaciones",
        variant: "destructive"
      });
    }
  });

  // Mutation to manually update flight status
  const updateFlightStatusMutation = useMutation({
    mutationFn: async ({ flightId, hasLanded }: { flightId: string, hasLanded: boolean }) => {
      const { error } = await supabase
        .from('flight_data')
        .update({ 
          has_landed: hasLanded,
          actual_arrival: hasLanded ? new Date().toISOString() : null 
        })
        .eq('id', flightId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-flight-notifications'] });
      toast({
        title: "Estado actualizado",
        description: "El estado del vuelo ha sido actualizado",
      });
    }
  });

  // Mutation to send test notification
  const sendTestNotificationMutation = useMutation({
    mutationFn: async ({ phone, message }: { phone: string, message: string }) => {
      const response = await supabase.functions.invoke('send-whatsapp-notification', {
        body: {
          notificationId: 'test-' + Date.now(),
          phone: phone,
          message: message
        }
      });

      if (response.error) throw response.error;
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: "Notificación de prueba enviada",
        description: "La notificación de prueba se envió correctamente",
      });
    },
    onError: (error: any) => {
      console.error('Error sending test notification:', error);
      toast({
        title: "Error",
        description: "No se pudo enviar la notificación de prueba",
        variant: "destructive"
      });
    }
  });

  return {
    pendingFlights,
    isLoading,
    processNotifications: processNotificationsMutation.mutate,
    updateFlightStatus: updateFlightStatusMutation.mutate,
    sendTestNotification: sendTestNotificationMutation.mutate,
    isProcessing: processNotificationsMutation.isPending,
    isSendingTest: sendTestNotificationMutation.isPending,
  };
}
