
import { supabase } from '@/integrations/supabase/client';
import { useNotifications } from './useNotifications';
import { useSentMessages } from './useSentMessages';
import { useToast } from './use-toast';

export function useChatMessages() {
  const { toast } = useToast();
  const { sendManualNotification, isManualSending } = useNotifications();
  const { saveSentMessage } = useSentMessages();

  const handleSendMessage = async (
    selectedPhone: string, 
    customerId: string | null,
    message: string, 
    image?: File
  ) => {
    try {
      let imageUrl: string | undefined;

      // Si hay una imagen seleccionada, subirla primero
      if (image) {
        const fileExt = image.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('chat-images')
          .upload(fileName, image);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('chat-images')
          .getPublicUrl(uploadData.path);
        
        imageUrl = publicUrl;
      }

      // Crear el mensaje final
      const finalMessage = message || (imageUrl ? '📷 Imagen' : '');

      if (!customerId) {
        // Crear entrada de notificación sin customer ID
        const { data: notificationData, error: logError } = await supabase
          .from('notification_log')
          .insert({
            package_id: null,
            customer_id: null,
            notification_type: 'manual_reply',
            message: finalMessage,
            status: 'pending'
          })
          .select()
          .single();

        if (logError) throw logError;

        // Enviar notificación WhatsApp
        const response = await supabase.functions.invoke('send-whatsapp-notification', {
          body: {
            notificationId: notificationData.id,
            phone: selectedPhone,
            message: finalMessage,
            imageUrl: imageUrl
          }
        });

        if (response.error) throw response.error;
      } else {
        // Usar sendManualNotification para clientes registrados
        await sendManualNotification({
          customerId: customerId,
          packageId: '',
          message: finalMessage,
          phone: selectedPhone
        });
      }

      // Guardar mensaje enviado en nuestra tabla
      saveSentMessage({
        customerId: customerId,
        phone: selectedPhone,
        message: finalMessage,
        imageUrl: imageUrl
      });

      toast({
        title: "Mensaje enviado",
        description: "Su respuesta ha sido enviada por WhatsApp",
      });

    } catch (error) {
      console.error('Error sending reply:', error);
      toast({
        title: "Error",
        description: "No se pudo enviar el mensaje",
        variant: "destructive"
      });
    }
  };

  return {
    handleSendMessage,
    isManualSending
  };
}
