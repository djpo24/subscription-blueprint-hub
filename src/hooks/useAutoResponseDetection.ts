
import { useEffect, useRef } from 'react';
import { useAdvancedBotToggle } from './useAdvancedBotToggle';
import { useAIWhatsAppResponse } from './useAIWhatsAppResponse';
import { useChatMessages } from './useChatMessages';
import { useToast } from './use-toast';
import { supabase } from '@/integrations/supabase/client';

export function useAutoResponseDetection() {
  const { isAutoResponseEnabled } = useAdvancedBotToggle();
  const { generateAIResponse } = useAIWhatsAppResponse();
  const { handleSendMessage } = useChatMessages();
  const { toast } = useToast();
  const processedMessages = useRef(new Set<string>());

  useEffect(() => {
    if (!isAutoResponseEnabled) {
      console.log('🤖 Auto responses disabled, skipping detection');
      return;
    }

    console.log('🤖 Starting auto-response detection...');

    // Subscribe to new incoming messages
    const channel = supabase
      .channel('auto-response-detection')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'incoming_messages'
        },
        async (payload) => {
          const newMessage = payload.new as any;
          console.log('🔔 New incoming message detected:', newMessage);

          // Skip if already processed
          if (processedMessages.current.has(newMessage.id)) {
            console.log('⏭️ Message already processed, skipping');
            return;
          }

          // Skip if not from customer
          if (!newMessage.from_phone || !newMessage.customer_id) {
            console.log('⏭️ Message not from registered customer, skipping auto-response');
            return;
          }

          // Mark as processed
          processedMessages.current.add(newMessage.id);

          try {
            console.log('🤖 Generating automatic response for:', {
              phone: newMessage.from_phone,
              customerId: newMessage.customer_id,
              message: newMessage.message_content
            });

            // Generate AI response
            const aiResponse = await generateAIResponse({
              message: newMessage.message_content || '',
              customerPhone: newMessage.from_phone,
              customerId: newMessage.customer_id
            });

            console.log('✅ AI response generated:', aiResponse.response);

            // Send the response automatically
            await handleSendMessage(
              newMessage.from_phone,
              newMessage.customer_id,
              aiResponse.response
            );

            console.log('📤 Automatic response sent successfully');

            toast({
              title: "🤖 Respuesta automática enviada",
              description: `SARA respondió automáticamente a ${newMessage.from_phone}`,
            });

          } catch (error) {
            console.error('❌ Error in automatic response:', error);
            
            // Send fallback response
            try {
              const fallbackMessage = "¡Hola! 😊 Gracias por escribirnos. Un miembro de nuestro equipo te contactará pronto para ayudarte.";
              
              await handleSendMessage(
                newMessage.from_phone,
                newMessage.customer_id,
                fallbackMessage
              );

              toast({
                title: "🤖 Respuesta automática de emergencia",
                description: "Se envió una respuesta básica debido a un error técnico",
                variant: "default"
              });
            } catch (fallbackError) {
              console.error('❌ Fallback response also failed:', fallbackError);
              toast({
                title: "❌ Error en respuesta automática",
                description: "No se pudo enviar respuesta automática",
                variant: "destructive"
              });
            }
          }
        }
      )
      .subscribe();

    console.log('🔔 Auto-response detection channel subscribed');

    return () => {
      console.log('🔕 Unsubscribing from auto-response detection');
      supabase.removeChannel(channel);
    };
  }, [isAutoResponseEnabled, generateAIResponse, handleSendMessage, toast]);

  return {
    isActive: isAutoResponseEnabled
  };
}
