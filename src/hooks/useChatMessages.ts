
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
      // Check if bucket exists
      const { data: buckets } = await supabase.storage.listBuckets();
      const chatBucketExists = buckets?.some(bucket => bucket.name === 'chat-images');
      
      if (!chatBucketExists) {
        // Try to create the bucket using the edge function
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
    console.log('handleSendMessage called with:', { selectedPhone, customerId, message, hasImage: !!image });
    
    try {
      // Validar que tengamos al menos un mensaje o imagen
      if (!message.trim() && !image) {
        throw new Error('Debe proporcionar un mensaje o una imagen');
      }

      // Validar el número de teléfono
      if (!selectedPhone || selectedPhone.trim() === '') {
        throw new Error('Número de teléfono requerido');
      }

      let imageUrl: string | undefined;

      // Si hay una imagen seleccionada, subirla primero
      if (image) {
        console.log('Processing image upload...');
        // Ensure the bucket exists before uploading
        await ensureChatStorageBucket();

        const fileExt = image.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        
        console.log('Attempting to upload image:', fileName);
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('chat-images')
          .upload(fileName, image, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error('Error uploading image:', uploadError);
          throw new Error('Error al subir la imagen: ' + uploadError.message);
        }

        const { data: { publicUrl } } = supabase.storage
          .from('chat-images')
          .getPublicUrl(uploadData.path);
        
        imageUrl = publicUrl;
        console.log('Image uploaded successfully:', imageUrl);
      }

      // Crear el mensaje final
      const finalMessage = message.trim() || (imageUrl ? '📷 Imagen' : '');
      console.log('Final message to send:', finalMessage);

      if (!customerId) {
        console.log('Sending to unregistered customer');
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

        if (logError) {
          console.error('Error creating notification log:', logError);
          throw new Error('Error al crear registro de notificación: ' + logError.message);
        }

        console.log('Notification log created:', notificationData.id);

        // Enviar notificación WhatsApp
        console.log('Calling WhatsApp function...');
        const { data: responseData, error: functionError } = await supabase.functions.invoke('send-whatsapp-notification', {
          body: {
            notificationId: notificationData.id,
            phone: selectedPhone,
            message: finalMessage,
            imageUrl: imageUrl
          }
        });

        if (functionError) {
          console.error('Function error:', functionError);
          
          // Detectar si es un error de token expirado
          if (functionError.message && functionError.message.includes('Session has expired')) {
            throw new Error('Token de WhatsApp expirado. Necesita renovar el token de acceso en la configuración de Meta.');
          }
          
          throw new Error('Error al enviar mensaje por WhatsApp: ' + functionError.message);
        }

        // Verificar si la respuesta indica un error de token
        if (responseData && responseData.error) {
          console.error('WhatsApp API error:', responseData.error);
          if (responseData.error.includes('Session has expired') || 
              responseData.error.includes('access token') ||
              responseData.error.includes('token')) {
            throw new Error('Token de WhatsApp expirado. Necesita renovar el token de acceso en la configuración de Meta.');
          }
          throw new Error('Error de WhatsApp: ' + responseData.error);
        }

        console.log('WhatsApp notification sent successfully:', responseData);
      } else {
        console.log('Sending to registered customer:', customerId);
        // Usar sendManualNotification para clientes registrados
        await sendManualNotification({
          customerId: customerId,
          packageId: '',
          message: finalMessage,
          phone: selectedPhone,
          imageUrl: imageUrl
        });
      }

      // Guardar mensaje enviado en nuestra tabla
      console.log('Saving sent message to database...');
      await saveSentMessage({
        customerId: customerId,
        phone: selectedPhone,
        message: finalMessage,
        imageUrl: imageUrl
      });

      console.log('Message sent successfully!');
      toast({
        title: "Mensaje enviado",
        description: "Su respuesta ha sido enviada por WhatsApp",
      });

    } catch (error) {
      console.error('Error sending reply:', error);
      
      let errorMessage = "No se pudo enviar el mensaje";
      
      if (error instanceof Error) {
        if (error.message.includes('Token de WhatsApp expirado')) {
          errorMessage = error.message;
        } else if (error.message.includes('row-level security policy')) {
          errorMessage = "Error de permisos para subir imágenes. Intente nuevamente.";
        } else if (error.message.includes('Bucket not found')) {
          errorMessage = "Error de configuración de almacenamiento. Reintentando...";
          // Retry once after ensuring bucket exists
          try {
            await ensureChatStorageBucket();
            toast({
              title: "Reintentando",
              description: "Configuración de almacenamiento reparada. Intente enviar nuevamente.",
            });
            return;
          } catch (retryError) {
            console.error('Error in retry:', retryError);
            errorMessage = "Error persistente de configuración de almacenamiento";
          }
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      
      // Re-lanzar el error para que lo maneje el componente padre si es necesario
      throw error;
    }
  };

  return {
    handleSendMessage,
    isManualSending
  };
}
