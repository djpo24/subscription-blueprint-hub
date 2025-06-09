
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

interface ManualNotificationData {
  customerId: string;
  packageId: string;
  message: string;
  phone: string;
  imageUrl?: string;
}

export function useNotifications() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const sendManualNotificationMutation = useMutation({
    mutationFn: async (data: ManualNotificationData) => {
      console.log('Sending manual notification:', data);

      // Validar datos requeridos
      if (!data.customerId || !data.phone || !data.message) {
        throw new Error('Datos incompletos para enviar notificación');
      }

      // Crear entrada en notification_log
      const { data: logEntry, error: logError } = await supabase
        .from('notification_log')
        .insert({
          customer_id: data.customerId,
          package_id: data.packageId || null,
          notification_type: 'manual_reply',
          message: data.message,
          status: 'pending'
        })
        .select()
        .single();

      if (logError) {
        console.error('Error creating notification log:', logError);
        throw new Error('Error al crear registro de notificación');
      }

      console.log('Notification log created:', logEntry.id);

      // Enviar notificación con customerId para detección automática de plantillas
      const { data: responseData, error: notificationError } = await supabase.functions.invoke('send-whatsapp-notification', {
        body: {
          notificationId: logEntry.id,
          phone: data.phone,
          message: data.message,
          imageUrl: data.imageUrl,
          customerId: data.customerId // Importante: pasar customerId para detección automática
        }
      });

      if (notificationError) {
        console.error('Error sending notification:', notificationError);
        
        // Detectar si es un error de token expirado
        if (notificationError.message && notificationError.message.includes('Session has expired')) {
          throw new Error('Token de WhatsApp expirado. Necesita renovar el token de acceso en la configuración de Meta.');
        }
        
        throw new Error('Error al enviar notificación: ' + notificationError.message);
      }

      // Verificar si la respuesta indica un error de token
      if (responseData && !responseData.success && responseData.error) {
        if (responseData.error.includes('Session has expired') || responseData.error.includes('access token')) {
          throw new Error('Token de WhatsApp expirado. Necesita renovar el token de acceso en la configuración de Meta.');
        }
        throw new Error('Error de WhatsApp: ' + responseData.error);
      }

      // Mostrar información adicional si se usó plantilla automáticamente
      if (responseData && responseData.autoDetected) {
        toast({
          title: "🔄 Plantilla detectada automáticamente",
          description: `Se usó la plantilla "${responseData.templateUsed}" por la regla de 24 horas`,
        });
      }

      console.log('Manual notification sent successfully:', responseData);
      return responseData;
    },
    onSuccess: () => {
      // Refrescar datos relacionados
      queryClient.invalidateQueries({ queryKey: ['notification-log'] });
      queryClient.invalidateQueries({ queryKey: ['chat-messages'] });
    },
    onError: (error: any) => {
      console.error('Error sending manual notification:', error);
    }
  });

  return {
    sendManualNotification: sendManualNotificationMutation.mutateAsync,
    isManualSending: sendManualNotificationMutation.isPending,
  };
}
