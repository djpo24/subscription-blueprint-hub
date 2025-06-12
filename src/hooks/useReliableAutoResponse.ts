
import { useCallback, useRef } from 'react';
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
  const processingRef = useRef(new Set<string>());

  const processAutoResponse = useCallback(async (message: DetectedMessage) => {
    // Verificar si ya se está procesando este mensaje
    if (processingRef.current.has(message.id)) {
      console.log('⏭️ Mensaje ya en procesamiento, omitiendo:', message.id);
      return false;
    }

    // Marcar como en procesamiento
    processingRef.current.add(message.id);

    console.log('🤖 ===== INICIANDO AUTO-RESPUESTA ÚNICA =====');
    console.log('📞 Teléfono:', message.from_phone);
    console.log('👤 Cliente:', message.customer_id ? 'REGISTRADO' : 'NO REGISTRADO');
    console.log('💬 Mensaje:', message.message_content.substring(0, 50) + '...');
    console.log('🆔 ID Mensaje:', message.id);

    try {
      // Paso 1: Generar respuesta con IA
      console.log('🧠 Generando respuesta única con IA...');
      
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
      console.log('📝 Creando log único de notificación...');
      
      const notificationType = message.customer_id ? 'auto_reply' : 'auto_reply_unregistered';
      
      const { data: notificationData, error: logError } = await supabase
        .from('notification_log')
        .insert({
          package_id: null,
          customer_id: message.customer_id,
          notification_type: notificationType,
          message: responseText,
          status: 'pending',
          metadata: {
            original_message_id: message.id,
            processed_at: new Date().toISOString()
          }
        })
        .select()
        .single();

      if (logError) {
        console.error('❌ Error creando log:', logError);
        throw new Error(`Error log: ${logError.message}`);
      }

      console.log('✅ Log único creado con ID:', notificationData.id);

      // Paso 3: Enviar por WhatsApp UNA SOLA VEZ
      console.log('📤 Enviando respuesta única por WhatsApp...');
      
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

      console.log('🎉 ===== AUTO-RESPUESTA ÚNICA ENVIADA EXITOSAMENTE =====');
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

      toast({
        title: "❌ Error en auto-respuesta",
        description: `No se pudo responder automáticamente a ${message.from_phone}`,
        variant: "destructive"
      });

      return false;
    } finally {
      // Remover del procesamiento después de un delay
      setTimeout(() => {
        processingRef.current.delete(message.id);
      }, 5000);
    }
  }, [toast]);

  return { processAutoResponse };
}
