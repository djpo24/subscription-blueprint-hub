
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useNotifications() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const notificationsQuery = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      console.log('🔍 Fetching notifications...');
      
      const { data, error } = await supabase
        .from('notification_log')
        .select(`
          *,
          customers!customer_id(name, phone, whatsapp_number),
          packages!package_id(tracking_number, destination, amount_to_collect, currency)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('❌ Error fetching notifications:', error);
        throw error;
      }

      console.log('✅ Notifications fetched:', data?.length || 0, 'notifications');
      return data || [];
    }
  });

  const sendManualNotificationMutation = useMutation({
    mutationFn: async ({ 
      customerId, 
      packageId, 
      message, 
      phone,
      imageUrl 
    }: { 
      customerId: string;
      packageId: string;
      message: string;
      phone: string;
      imageUrl?: string;
    }) => {
      console.log('📤 Sending manual notification:', { customerId, packageId, message, phone });
      
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
        throw new Error('Error al crear registro de notificación');
      }

      // Send via WhatsApp
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
        console.error('❌ WhatsApp function error:', functionError);
        throw new Error('Error al enviar mensaje por WhatsApp: ' + functionError.message);
      }

      if (responseData && responseData.error) {
        console.error('❌ WhatsApp API error:', responseData.error);
        throw new Error('Error de WhatsApp: ' + responseData.error);
      }

      console.log('✅ Manual notification sent successfully');
      return responseData;
    },
    onSuccess: () => {
      toast({
        title: "¡Mensaje enviado!",
        description: "Su mensaje ha sido enviado por WhatsApp correctamente",
      });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['sent-messages'] });
    },
    onError: (error: any) => {
      console.error('❌ Error sending manual notification:', error);
      toast({
        title: "❌ Error enviando mensaje",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Create a promise-based version for easier async handling
  const sendManualNotificationAsync = async (params: { 
    customerId: string;
    packageId: string;
    message: string;
    phone: string;
    imageUrl?: string;
  }) => {
    return new Promise((resolve, reject) => {
      sendManualNotificationMutation.mutate(params, {
        onSuccess: (data) => resolve(data),
        onError: (error) => reject(error)
      });
    });
  };

  return {
    ...notificationsQuery,
    sendManualNotification: sendManualNotificationMutation.mutate,
    sendManualNotificationAsync,
    isManualSending: sendManualNotificationMutation.isPending
  };
}
