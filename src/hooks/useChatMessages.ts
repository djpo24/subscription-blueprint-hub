
import { useToast } from './use-toast';
import { useNotifications } from './useNotifications';
import { useSentMessages } from './useSentMessages';
import { useMessageValidation } from '@/utils/messageValidation';
import { uploadImage } from '@/utils/chatStorage';
import { useErrorHandler } from '@/utils/errorHandler';
import { supabase } from '@/integrations/supabase/client';

export function useChatMessages() {
  const { toast } = useToast();
  const { sendManualNotificationAsync, isManualSending } = useNotifications();
  const { saveSentMessage } = useSentMessages();
  const { validateMessage } = useMessageValidation();
  const { handleError } = useErrorHandler();

  const handleSendMessage = async (
    selectedPhone: string, 
    customerId: string | null,
    message: string, 
    image?: File
  ) => {
    console.log('🚀 Starting message send process:', { selectedPhone, customerId, message: message.substring(0, 50) + '...', hasImage: !!image });
    
    try {
      // Validaciones básicas
      if (!validateMessage(message, image, selectedPhone)) {
        return;
      }

      // Limpiar el número de teléfono
      const cleanPhone = selectedPhone.replace(/[\s\-\(\)\+]/g, '');
      console.log('📞 Phone cleaned:', { original: selectedPhone, cleaned: cleanPhone });

      let imageUrl: string | undefined;

      // Subir imagen si existe
      if (image) {
        imageUrl = await uploadImage(image);
      }

      const finalMessage = message.trim() || (imageUrl ? '📷 Imagen' : '');
      console.log('💬 Final message prepared:', finalMessage);

      // Guardar mensaje enviado ANTES de enviar (para evitar pérdida)
      console.log('💾 Saving sent message to database...');
      await saveSentMessage({
        customerId: customerId,
        phone: selectedPhone,
        message: finalMessage,
        imageUrl: imageUrl
      });
      console.log('✅ Message saved to database');

      // Enviar mensaje por WhatsApp
      if (customerId) {
        // Cliente registrado - usar sendManualNotificationAsync
        console.log('👤 Sending to registered customer');
        await sendManualNotificationAsync({
          customerId: customerId,
          packageId: '',
          message: finalMessage,
          phone: selectedPhone,
          imageUrl: imageUrl
        });
      } else {
        // Cliente no registrado - envío directo con detección automática de plantillas
        console.log('👤 Sending to unregistered customer');
        
        // Crear entrada de notificación
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

        if (logError) {
          console.error('❌ Error creating notification log:', logError);
          throw new Error('Error al crear registro de notificación');
        }

        // Enviar a WhatsApp con customerId para detección automática de plantillas
        const { data: responseData, error: functionError } = await supabase.functions.invoke('send-whatsapp-notification', {
          body: {
            notificationId: notificationData.id,
            phone: selectedPhone,
            message: finalMessage,
            imageUrl: imageUrl,
            customerId: customerId // Pasar customerId para detección automática
          }
        });

        if (functionError) {
          console.error('❌ WhatsApp function error:', functionError);
          
          if (functionError.message && functionError.message.includes('Session has expired')) {
            throw new Error('Token de WhatsApp expirado. Necesita renovar el token de acceso en la configuración de Meta.');
          }
          
          throw new Error('Error al enviar mensaje por WhatsApp: ' + functionError.message);
        }

        if (responseData && responseData.error) {
          console.error('❌ WhatsApp API error:', responseData.error);
          if (responseData.error.includes('Session has expired') || 
              responseData.error.includes('access token') ||
              responseData.error.includes('token')) {
            throw new Error('Token de WhatsApp expirado. Necesita renovar el token de acceso en la configuración de Meta.');
          }
          throw new Error('Error de WhatsApp: ' + responseData.error);
        }

        // Mostrar información adicional si se usó plantilla automáticamente
        if (responseData && responseData.autoDetected) {
          console.log('✅ Plantilla detectada automáticamente:', responseData.templateUsed);
        }

        console.log('✅ WhatsApp message sent successfully');
        
        // Show success toast for unregistered customers too
        toast({
          title: "¡Mensaje enviado!",
          description: "Su mensaje ha sido enviado por WhatsApp correctamente",
        });
      }

      console.log('🎉 Message sent successfully!');

    } catch (error) {
      handleError(error);
    }
  };

  return {
    handleSendMessage,
    isManualSending
  };
}
