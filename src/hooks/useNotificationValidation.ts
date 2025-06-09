
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

interface ResendNotificationData {
  notificationId: string;
  customerId: string;
  packageId?: string;
  message: string;
  phone: string;
}

export function useNotificationValidation() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const resendNotificationMutation = useMutation({
    mutationFn: async (data: ResendNotificationData) => {
      console.log('🔄 Reenviando notificación:', data);

      // Reenviar notificación via WhatsApp con detección automática de plantillas
      const { data: responseData, error: functionError } = await supabase.functions.invoke('send-whatsapp-notification', {
        body: {
          notificationId: data.notificationId,
          phone: data.phone,
          message: data.message,
          customerId: data.customerId,
          packageId: data.packageId || null,
          useTemplate: true,
          templateName: 'package_arrival_notification',
          templateLanguage: 'es_CO'
        }
      });

      if (functionError) {
        console.error('❌ Error reenviando notificación:', functionError);
        
        if (functionError.message && functionError.message.includes('Session has expired')) {
          throw new Error('Token de WhatsApp expirado. Necesita renovar el token de acceso en la configuración de Meta.');
        }
        
        throw new Error('Error al reenviar notificación: ' + functionError.message);
      }

      if (responseData && !responseData.success && responseData.error) {
        if (responseData.error.includes('Session has expired') || responseData.error.includes('access token')) {
          throw new Error('Token de WhatsApp expirado. Necesita renovar el token de acceso en la configuración de Meta.');
        }
        throw new Error('Error de WhatsApp: ' + responseData.error);
      }

      // Registrar el mensaje reenviado en sent_messages si fue exitoso
      if (responseData && responseData.success) {
        console.log('📝 Registrando mensaje reenviado en sent_messages...');
        const { error: sentMessageError } = await supabase
          .from('sent_messages')
          .insert({
            customer_id: data.customerId,
            phone: data.phone,
            message: data.message,
            status: 'sent'
          });

        if (sentMessageError) {
          console.error('Error registrando mensaje reenviado:', sentMessageError);
          // No lanzamos error aquí ya que la notificación ya se reenvió exitosamente
        } else {
          console.log('✅ Mensaje reenviado registrado en chat');
        }
      }

      console.log('✅ Notificación reenviada exitosamente:', responseData);
      return responseData;
    },
    onSuccess: (result) => {
      let message = "✅ Notificación reenviada exitosamente";
      
      if (result && result.autoDetected) {
        message += ` (plantilla "${result.templateUsed}" detectada automáticamente)`;
      }
      
      toast({
        title: message,
        description: "La notificación ha sido procesada correctamente",
      });
      
      // Refrescar datos relacionados
      queryClient.invalidateQueries({ queryKey: ['notification-log'] });
      queryClient.invalidateQueries({ queryKey: ['chat-messages'] });
      queryClient.invalidateQueries({ queryKey: ['sent-messages'] }); // Refrescar mensajes enviados
    },
    onError: (error: any) => {
      console.error('Error reenviando notificación:', error);
      toast({
        title: "❌ Error al reenviar",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  return {
    resendNotification: resendNotificationMutation.mutateAsync,
    isResending: resendNotificationMutation.isPending,
  };
}
