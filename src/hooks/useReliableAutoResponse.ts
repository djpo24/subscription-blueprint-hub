
import { useCallback } from 'react';
import { useToast } from './use-toast';
import { supabase } from '@/integrations/supabase/client';

interface DetectedMessage {
  id: string;
  from_phone: string;
  customer_id: string | null;
  message_content: string;
  timestamp: string;
}

export function useReliableAutoResponse() {
  const { toast } = useToast();

  const processAutoResponse = useCallback(async (message: DetectedMessage) => {
    console.log('🤖 PROCESANDO AUTO-RESPUESTA AUTOMÁTICA para:', {
      id: message.id,
      phone: message.from_phone,
      isRegistered: !!message.customer_id,
      messagePreview: message.message_content.substring(0, 50) + '...'
    });

    try {
      // Paso 1: Generar respuesta IA
      console.log('🧠 Generando respuesta IA automática...');
      
      const { data: aiResponse, error: aiError } = await supabase.functions.invoke('ai-whatsapp-response', {
        body: {
          message: message.message_content,
          customerPhone: message.from_phone,
          customerId: message.customer_id
        }
      });

      if (aiError) {
        throw new Error(`Error IA: ${aiError.message}`);
      }

      const responseText = aiResponse?.response;
      if (!responseText) {
        throw new Error('Respuesta IA vacía');
      }

      console.log('✅ Respuesta IA generada automáticamente:', responseText.substring(0, 100) + '...');

      // Paso 2: Crear log de notificación
      console.log('📝 Creando log de auto-respuesta...');
      
      const { data: notificationData, error: logError } = await supabase
        .from('notification_log')
        .insert({
          package_id: null,
          customer_id: message.customer_id,
          notification_type: message.customer_id ? 'auto_reply' : 'auto_reply_unregistered',
          message: responseText,
          status: 'pending'
        })
        .select()
        .single();

      if (logError) {
        throw new Error(`Error log: ${logError.message}`);
      }

      console.log('✅ Log de auto-respuesta creado:', notificationData.id);

      // Paso 3: Enviar por WhatsApp automáticamente
      console.log('📤 Enviando auto-respuesta por WhatsApp...');
      
      const { data: whatsappResponse, error: whatsappError } = await supabase.functions.invoke('send-whatsapp-notification', {
        body: {
          notificationId: notificationData.id,
          phone: message.from_phone,
          message: responseText,
          customerId: message.customer_id
        }
      });

      if (whatsappError) {
        throw new Error(`Error WhatsApp: ${whatsappError.message}`);
      }

      if (whatsappResponse?.error) {
        throw new Error(`API WhatsApp: ${whatsappResponse.error}`);
      }

      console.log('🎉 AUTO-RESPUESTA ENVIADA EXITOSAMENTE a:', message.from_phone);

      const customerType = message.customer_id ? 'cliente registrado' : 'cliente no registrado';
      toast({
        title: "🤖 Respuesta automática enviada",
        description: `SARA respondió automáticamente a ${message.from_phone} (${customerType})`,
      });

      return true;

    } catch (error: any) {
      console.error('❌ Error en auto-respuesta automática:', error);

      // Intentar respuesta de emergencia automática
      try {
        console.log('🚨 Enviando respuesta de emergencia automática...');
        
        const emergencyResponse = "¡Hola! 😊 Gracias por escribirnos. Un miembro de nuestro equipo te contactará pronto.";
        
        const { data: emergencyLog } = await supabase
          .from('notification_log')
          .insert({
            package_id: null,
            customer_id: message.customer_id,
            notification_type: 'auto_reply_emergency',
            message: emergencyResponse,
            status: 'pending'
          })
          .select()
          .single();

        if (emergencyLog) {
          await supabase.functions.invoke('send-whatsapp-notification', {
            body: {
              notificationId: emergencyLog.id,
              phone: message.from_phone,
              message: emergencyResponse,
              customerId: message.customer_id
            }
          });

          toast({
            title: "🤖 Respuesta de emergencia enviada",
            description: `Se envió respuesta básica automática debido a error técnico`,
          });

          return true;
        }
      } catch (emergencyError) {
        console.error('❌ Error en respuesta de emergencia automática:', emergencyError);
      }

      toast({
        title: "❌ Error en auto-respuesta",
        description: `No se pudo responder automáticamente a ${message.from_phone}`,
        variant: "destructive"
      });

      return false;
    }
  }, [toast]);

  return { processAutoResponse };
}
