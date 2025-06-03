
import { supabase } from '@/integrations/supabase/client';
import { useNotifications } from './useNotifications';
import { useSentMessages } from './useSentMessages';
import { useToast } from './use-toast';

export function useChatMessages() {
  const { toast } = useToast();
  const { sendManualNotification, isManualSending } = useNotifications();
  const { saveSentMessage } = useSentMessages();

  const ensureChatStorageBucket = async () => {
    try {
      const { data: buckets } = await supabase.storage.listBuckets();
      const chatBucketExists = buckets?.some(bucket => bucket.name === 'chat-images');
      
      if (!chatBucketExists) {
        const { error } = await supabase.functions.invoke('create-chat-storage');
        if (error) {
          console.error('Error creating chat storage bucket:', error);
          throw error;
        }
        console.log('Chat storage bucket created successfully');
      }
    } catch (error) {
      console.error('Error ensuring chat storage bucket:', error);
      throw error;
    }
  };

  const handleSendMessage = async (
    selectedPhone: string, 
    customerId: string | null,
    message: string, 
    image?: File
  ) => {
    console.log('🚀 Starting message send process:', { selectedPhone, customerId, message: message.substring(0, 50) + '...', hasImage: !!image });
    
    try {
      // Validaciones básicas
      if (!message.trim() && !image) {
        toast({
          title: "Error",
          description: "Debe escribir un mensaje o adjuntar una imagen",
          variant: "destructive"
        });
        return;
      }

      if (!selectedPhone) {
        toast({
          title: "Error", 
          description: "No se ha seleccionado un número de teléfono",
          variant: "destructive"
        });
        return;
      }

      // Limpiar el número de teléfono
      const cleanPhone = selectedPhone.replace(/[\s\-\(\)\+]/g, '');
      console.log('📞 Phone cleaned:', { original: selectedPhone, cleaned: cleanPhone });

      let imageUrl: string | undefined;

      // Subir imagen si existe
      if (image) {
        console.log('📸 Uploading image...');
        await ensureChatStorageBucket();

        const fileExt = image.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('chat-images')
          .upload(fileName, image, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error('❌ Image upload failed:', uploadError);
          throw new Error('Error al subir la imagen: ' + uploadError.message);
        }

        const { data: { publicUrl } } = supabase.storage
          .from('chat-images')
          .getPublicUrl(uploadData.path);
        
        imageUrl = publicUrl;
        console.log('✅ Image uploaded successfully:', imageUrl);
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
      console.log('📱 Sending WhatsApp message...');
      
      if (customerId) {
        // Cliente registrado - usar sendManualNotification
        console.log('👤 Sending to registered customer');
        await sendManualNotification({
          customerId: customerId,
          packageId: '',
          message: finalMessage,
          phone: selectedPhone,
          imageUrl: imageUrl
        });
      } else {
        // Cliente no registrado - envío directo
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

        // Enviar a WhatsApp
        const { data: responseData, error: functionError } = await supabase.functions.invoke('send-whatsapp-notification', {
          body: {
            notificationId: notificationData.id,
            phone: selectedPhone,
            message: finalMessage,
            imageUrl: imageUrl
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

        console.log('✅ WhatsApp message sent successfully');
      }

      console.log('🎉 Message sent successfully!');
      toast({
        title: "¡Mensaje enviado!",
        description: "Su mensaje ha sido enviado por WhatsApp correctamente",
      });

    } catch (error) {
      console.error('❌ Error in message send process:', error);
      
      let errorMessage = "No se pudo enviar el mensaje";
      
      if (error instanceof Error) {
        if (error.message.includes('Token de WhatsApp expirado')) {
          errorMessage = error.message;
        } else if (error.message.includes('row-level security policy')) {
          errorMessage = "Error de permisos. Intente nuevamente.";
        } else if (error.message.includes('Bucket not found')) {
          errorMessage = "Error de configuración de almacenamiento.";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Error al enviar mensaje",
        description: errorMessage,
        variant: "destructive"
      });
      
      throw error;
    }
  };

  return {
    handleSendMessage,
    isManualSending
  };
}
