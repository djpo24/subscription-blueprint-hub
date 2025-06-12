
import { useCallback } from 'react';
import { useToast } from './use-toast';
import { useAIResponseProcessor } from './useAIResponseProcessor';
import { useWhatsAppSender } from './useWhatsAppSender';

interface DetectedMessage {
  id: string;
  from_phone: string;
  customer_id: string;
  message_content: string;
  timestamp: string;
}

export function useAutoResponseEngine() {
  const { toast } = useToast();
  const { processAIResponse } = useAIResponseProcessor();
  const { sendWhatsAppMessage } = useWhatsAppSender();

  const handleAutoResponse = useCallback(async (message: DetectedMessage) => {
    console.log('🎯 Starting auto-response engine for message:', message.id);

    try {
      // Step 1: Generate AI response
      console.log('🤖 Step 1: Generating AI response...');
      const aiResponse = await processAIResponse({
        message: message.message_content,
        customerPhone: message.from_phone,
        customerId: message.customer_id
      });

      // Step 2: Send via WhatsApp
      console.log('📤 Step 2: Sending WhatsApp message...');
      const sendSuccess = await sendWhatsAppMessage({
        phone: message.from_phone,
        message: aiResponse,
        customerId: message.customer_id,
        notificationType: 'auto_reply'
      });

      if (sendSuccess) {
        console.log('🎉 Auto-response completed successfully');
        
        toast({
          title: "🤖 Respuesta automática enviada",
          description: `SARA respondió automáticamente a ${message.from_phone}`,
        });
      } else {
        throw new Error('Failed to send WhatsApp message');
      }

    } catch (error) {
      console.error('❌ Auto-response engine error:', error);
      
      // Try to send emergency fallback
      try {
        console.log('🚨 Attempting emergency fallback...');
        const emergencyResponse = "¡Hola! 😊 Gracias por escribirnos. Un miembro de nuestro equipo te contactará pronto.";
        
        const fallbackSuccess = await sendWhatsAppMessage({
          phone: message.from_phone,
          message: emergencyResponse,
          customerId: message.customer_id,
          notificationType: 'auto_reply_fallback'
        });

        if (fallbackSuccess) {
          toast({
            title: "🤖 Respuesta de emergencia enviada",
            description: "Se envió una respuesta básica debido a un error técnico",
          });
        } else {
          throw new Error('Emergency fallback also failed');
        }

      } catch (fallbackError) {
        console.error('❌ Emergency fallback failed:', fallbackError);
        
        toast({
          title: "❌ Error en respuesta automática",
          description: "No se pudo enviar respuesta automática",
          variant: "destructive"
        });
      }
    }
  }, [processAIResponse, sendWhatsAppMessage, toast]);

  return { handleAutoResponse };
}
