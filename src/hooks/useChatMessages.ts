
import { useToast } from './use-toast';
import { useNotifications } from './useNotifications';
import { useSentMessages } from './useSentMessages';
import { useMessageValidation } from '@/utils/messageValidation';
import { uploadImage } from '@/utils/chatStorage';
import { sendWhatsAppMessage } from '@/utils/whatsappSender';
import { useErrorHandler } from '@/utils/errorHandler';

export function useChatMessages() {
  const { toast } = useToast();
  const { sendManualNotification, isManualSending } = useNotifications();
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
      await sendWhatsAppMessage({
        selectedPhone,
        customerId,
        message: finalMessage,
        imageUrl,
        sendManualNotification
      });

      console.log('🎉 Message sent successfully!');
      toast({
        title: "¡Mensaje enviado!",
        description: "Su mensaje ha sido enviado por WhatsApp correctamente",
      });

    } catch (error) {
      handleError(error);
    }
  };

  return {
    handleSendMessage,
    isManualSending
  };
}
