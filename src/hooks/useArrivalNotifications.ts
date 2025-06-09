
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

export function useArrivalNotifications() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Obtener notificaciones pendientes de llegada
  const { data: pendingNotifications = [], isLoading } = useQuery({
    queryKey: ['arrival-notifications-pending'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notification_log')
        .select(`
          *,
          customers (
            name,
            phone,
            whatsapp_number
          ),
          packages (
            tracking_number,
            destination,
            amount_to_collect,
            currency
          )
        `)
        .eq('notification_type', 'package_arrival')
        .eq('status', 'pending')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching pending notifications:', error);
        throw error;
      }

      return data || [];
    },
    refetchInterval: 30000, // Refrescar cada 30 segundos
  });

  // Procesar notificaciones pendientes
  const processNotificationsMutation = useMutation({
    mutationFn: async () => {
      console.log('🔄 Procesando notificaciones de llegada pendientes...');

      for (const notification of pendingNotifications) {
        try {
          const customerPhone = notification.customers?.whatsapp_number || notification.customers?.phone;
          
          if (!customerPhone) {
            console.warn(`⚠️ No hay teléfono para la notificación ${notification.id}`);
            continue;
          }

          console.log(`📱 Enviando notificación de llegada para ${notification.packages?.tracking_number}`);

          // Marcar como procesando
          await supabase
            .from('notification_log')
            .update({ status: 'processing' })
            .eq('id', notification.id);

          // Enviar notificación via WhatsApp
          const { data: responseData, error: functionError } = await supabase.functions.invoke('send-whatsapp-notification', {
            body: {
              notificationId: notification.id,
              phone: customerPhone,
              message: notification.message,
              customerId: notification.customer_id,
              useTemplate: true,
              templateName: 'package_arrival_notification',
              templateLanguage: 'es'
            }
          });

          if (functionError) {
            console.error(`❌ Error enviando notificación ${notification.id}:`, functionError);
            
            // Marcar como fallido
            await supabase
              .from('notification_log')
              .update({ 
                status: 'failed',
                error_message: functionError.message
              })
              .eq('id', notification.id);
          } else if (responseData?.success) {
            console.log(`✅ Notificación ${notification.id} enviada exitosamente`);
            
            // Marcar como enviado
            await supabase
              .from('notification_log')
              .update({ 
                status: 'sent',
                sent_at: new Date().toISOString()
              })
              .eq('id', notification.id);
          }

        } catch (error) {
          console.error(`❌ Error procesando notificación ${notification.id}:`, error);
          
          // Marcar como fallido
          await supabase
            .from('notification_log')
            .update({ 
              status: 'failed',
              error_message: error.message
            })
            .eq('id', notification.id);
        }
      }

      return { processed: pendingNotifications.length };
    },
    onSuccess: (result) => {
      toast({
        title: "✅ Notificaciones procesadas",
        description: `Se procesaron ${result.processed} notificaciones de llegada`,
      });
      
      // Refrescar las queries
      queryClient.invalidateQueries({ queryKey: ['arrival-notifications-pending'] });
      queryClient.invalidateQueries({ queryKey: ['notification-log'] });
    },
    onError: (error: any) => {
      toast({
        title: "❌ Error procesando notificaciones",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  return {
    pendingNotifications,
    isLoading,
    processNotifications: processNotificationsMutation.mutateAsync,
    isProcessing: processNotificationsMutation.isPending,
  };
}
