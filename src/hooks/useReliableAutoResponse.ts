
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
    console.log('🤖 ===== INICIANDO AUTO-RESPUESTA =====');
    console.log('📞 Teléfono:', message.from_phone);
    console.log('👤 Cliente:', message.customer_id ? 'REGISTRADO' : 'NO REGISTRADO');
    console.log('💬 Mensaje:', message.message_content);
    console.log('🆔 ID Mensaje:', message.id);

    try {
      // Paso 1: Generar respuesta con IA
      console.log('🧠 Generando respuesta con IA...');
      
      const { data: aiResponse, error: aiError } = await supabase.functions.invoke('ai-whatsapp-response', {
        body: {
          message: message.message_content,
          customerPhone: message.from_phone,
          customerId: message.customer_id
        }
      });

      if (aiError) {
        console.error('❌ Error en IA:', aiError);
        throw new Error(`Error IA: ${aiError.message}`);
      }

      const responseText = aiResponse?.response;
      if (!responseText) {
        console.error('❌ Respuesta IA vacía');
        throw new Error('Respuesta IA vacía');
      }

      console.log('✅ Respuesta IA generada:', responseText.substring(0, 100) + '...');

      // Paso 2: Crear log de notificación
      console.log('📝 Creando log de notificación...');
      
      const notificationType = message.customer_id ? 'auto_reply' : 'auto_reply_unregistered';
      
      const { data: notificationData, error: logError } = await supabase
        .from('notification_log')
        .insert({
          package_id: null,
          customer_id: message.customer_id,
          notification_type: notificationType,
          message: responseText,
          status: 'pending'
        })
        .select()
        .single();

      if (logError) {
        console.error('❌ Error creando log:', logError);
        throw new Error(`Error log: ${logError.message}`);
      }

      console.log('✅ Log creado con ID:', notificationData.id);

      // Paso 3: Enviar por WhatsApp
      console.log('📤 Enviando por WhatsApp...');
      
      const { data: whatsappResponse, error: whatsappError } = await supabase.functions.invoke('send-whatsapp-notification', {
        body: {
          notificationId: notificationData.id,
          phone: message.from_phone,
          message: responseText,
          customerId: message.customer_id
        }
      });

      if (whatsappError) {
        console.error('❌ Error función WhatsApp:', whatsappError);
        throw new Error(`Error WhatsApp: ${whatsappError.message}`);
      }

      if (whatsappResponse?.error) {
        console.error('❌ Error API WhatsApp:', whatsappResponse.error);
        throw new Error(`API WhatsApp: ${whatsappResponse.error}`);
      }

      console.log('🎉 ===== AUTO-RESPUESTA ENVIADA EXITOSAMENTE =====');
      console.log('📞 Enviado a:', message.from_phone);
      console.log('👤 Tipo cliente:', message.customer_id ? 'registrado' : 'no registrado');

      const customerType = message.customer_id ? 'cliente registrado' : 'cliente no registrado';
      toast({
        title: "🤖 Respuesta automática enviada",
        description: `SARA respondió automáticamente a ${message.from_phone} (${customerType})`,
      });

      return true;

    } catch (error: any) {
      console.error('❌ ===== ERROR EN AUTO-RESPUESTA =====');
      console.error('Error:', error.message);
      console.error('Teléfono:', message.from_phone);

      // Intentar respuesta de emergencia
      try {
        console.log('🚨 Enviando respuesta de emergencia...');
        
        const emergencyResponse = "¡Hola! 😊 Gracias por escribirnos. Un miembro de nuestro equipo te contactará pronto.";
        
        const { data: emergencyLog, error: emergencyLogError } = await supabase
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

        if (!emergencyLogError && emergencyLog) {
          const { error: emergencySendError } = await supabase.functions.invoke('send-whatsapp-notification', {
            body: {
              notificationId: emergencyLog.id,
              phone: message.from_phone,
              message: emergencyResponse,
              customerId: message.customer_id
            }
          });

          if (!emergencySendError) {
            console.log('✅ Respuesta de emergencia enviada');
            toast({
              title: "🤖 Respuesta de emergencia enviada",
              description: `Se envió respuesta básica debido a error técnico`,
            });
            return true;
          }
        }
      } catch (emergencyError) {
        console.error('❌ Error en respuesta de emergencia:', emergencyError);
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
