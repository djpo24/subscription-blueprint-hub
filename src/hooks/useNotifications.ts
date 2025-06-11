
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';
import type { NotificationLogEntry } from '@/types/supabase-temp';

export function useNotifications() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading, error } = useQuery({
    queryKey: ['notifications'],
    queryFn: async (): Promise<NotificationLogEntry[]> => {
      console.log('🔍 Fetching notifications...');
      
      try {
        // Use the specific foreign key relationship to avoid ambiguity
        const { data, error } = await supabase
          .from('notification_log')
          .select(`
            *,
            customers!fk_notification_log_customer (
              name,
              phone,
              whatsapp_number
            ),
            packages!package_id (
              tracking_number,
              destination,
              amount_to_collect,
              currency
            )
          `)
          .order('created_at', { ascending: false })
          .limit(50);

        if (error) {
          console.error('❌ Error fetching notifications:', error);
          throw error;
        }

        return (data || []).map(notification => ({
          id: notification.id,
          customer_id: notification.customer_id,
          package_id: notification.package_id,
          message: notification.message,
          status: notification.status,
          created_at: notification.created_at,
          sent_at: notification.sent_at,
          notification_type: notification.notification_type || 'manual',
          error_message: notification.error_message || undefined,
          customers: notification.customers,
          packages: notification.packages
        }));
      } catch (error) {
        console.error('❌ Error in useNotifications:', error);
        return [];
      }
    },
    refetchInterval: 30000,
  });

  const sendManualNotification = useMutation({
    mutationFn: async ({ customerId, packageId, message, phone, imageUrl }: {
      customerId: string;
      packageId?: string;
      message: string;
      phone: string;
      imageUrl?: string;
    }) => {
      console.log('📤 Sending manual notification...', { customerId, packageId, message, phone, imageUrl });

      // Create notification log entry
      const { data: notificationData, error: logError } = await supabase
        .from('notification_log')
        .insert({
          customer_id: customerId,
          package_id: packageId || null,
          notification_type: 'manual',
          message: message,
          status: 'pending'
        })
        .select()
        .single();

      if (logError) {
        console.error('❌ Error creating notification log:', logError);
        throw new Error(`Error al crear registro de notificación: ${logError.message}`);
      }

      console.log('✅ Notification log created:', notificationData);

      // Send WhatsApp message
      const { data: responseData, error: functionError } = await supabase.functions.invoke('send-whatsapp-notification', {
        body: {
          notificationId: notificationData.id,
          phone: phone,
          message: message,
          imageUrl: imageUrl,
          customerId: customerId
        }
      });

      if (functionError) {
        console.error('❌ Error sending WhatsApp message:', functionError);
        throw new Error(`Error enviando mensaje: ${functionError.message}`);
      }

      if (!responseData?.success) {
        const errorMsg = responseData?.error || 'Error desconocido';
        console.error('❌ WhatsApp API error:', errorMsg);
        throw new Error(errorMsg);
      }

      console.log('✅ Manual notification sent successfully');
      return responseData;
    },
    onSuccess: () => {
      toast({
        title: "✅ Mensaje enviado",
        description: "El mensaje se envió correctamente por WhatsApp",
      });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (error: any) => {
      console.error('❌ Error sending manual notification:', error);
      const userFriendlyMessage = error.message.includes('Token de WhatsApp') 
        ? error.message 
        : `Error al enviar mensaje: ${error.message}`;
      
      toast({
        title: "❌ Error al enviar mensaje",
        description: userFriendlyMessage,
        variant: "destructive"
      });
    }
  });

  return {
    notifications,
    isLoading,
    error,
    sendManualNotification: sendManualNotification.mutate,
    isManualSending: sendManualNotification.isPending
  };
}
