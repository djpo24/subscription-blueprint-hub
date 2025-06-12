
import { useCallback } from 'react';
import { useToast } from './use-toast';
import { useAIResponseProcessor } from './useAIResponseProcessor';
import { useWhatsAppSender } from './useWhatsAppSender';

interface DetectedMessage {
  id: string;
  from_phone: string;
  customer_id: string | null;
  message_content: string;
  timestamp: string;
}

export function useAutoResponseEngine() {
  const { toast } = useToast();
  const { processAIResponse } = useAIResponseProcessor();
  const { sendWhatsAppMessage } = useWhatsAppSender();

  const handleAutoResponse = useCallback(async (message: DetectedMessage) => {
    console.log('🎯 Starting auto-response engine for message:', {
      id: message.id,
      phone: message.from_phone,
      customerId: message.customer_id || 'UNREGISTERED',
      isRegistered: !!message.customer_id,
      content: message.message_content?.substring(0, 50) + '...'
    });

    try {
      // Add a small delay to ensure message is fully processed
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Step 1: Generate AI response
      console.log('🤖 Step 1: Generating AI response...');
      const aiResponse = await processAIResponse({
        message: message.message_content,
        customerPhone: message.from_phone,
        customerId: message.customer_id
      });

      console.log('✅ AI response generated:', aiResponse.substring(0, 100) + '...');

      // Step 2: Send via WhatsApp
      console.log('📤 Step 2: Sending WhatsApp message...');
      const sendSuccess = await sendWhatsAppMessage({
        phone: message.from_phone,
        message: aiResponse,
        customerId: message.customer_id,
        notificationType: message.customer_id ? 'auto_reply' : 'auto_reply_unregistered'
      });

      if (sendSuccess) {
        console.log('🎉 Auto-response completed successfully');
        
        const customerType = message.customer_id ? 'cliente registrado' : 'cliente no registrado';
        toast({
          title: "🤖 Respuesta automática enviada",
          description: `SARA respondió automáticamente a ${message.from_phone} (${customerType})`,
        });
      } else {
        throw new Error('Failed to send WhatsApp message');
      }

    } catch (error) {
      console.error('❌ Auto-response engine error:', error);
      
      // Try emergency fallback
      try {
        console.log('🚨 Attempting emergency fallback...');
        const emergencyResponse = "¡Hola! 😊 Gracias por escribirnos. Un miembro de nuestro equipo te contactará pronto.";
        
        const fallbackSuccess = await sendWhatsAppMessage({
          phone: message.from_phone,
          message: emergencyResponse,
          customerId: message.customer_id,
          notificationType: message.customer_id ? 'auto_reply_fallback' : 'auto_reply_fallback_unregistered'
        });

        if (fallbackSuccess) {
          const customerType = message.customer_id ? 'cliente registrado' : 'cliente no registrado';
          toast({
            title: "🤖 Respuesta de emergencia enviada",
            description: `Se envió una respuesta básica a ${customerType} debido a un error técnico`,
          });
        } else {
          throw new Error('Emergency fallback also failed');
        }

      } catch (fallbackError) {
        console.error('❌ Emergency fallback failed:', fallbackError);
        
        toast({
          title: "❌ Error en respuesta automática",
          description: `No se pudo enviar respuesta automática a ${message.from_phone}`,
          variant: "destructive"
        });
      }
    }
  }, [processAIResponse, sendWhatsAppMessage, toast]);

  return { handleAutoResponse };
}
