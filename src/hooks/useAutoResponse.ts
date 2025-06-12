
import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAIWhatsAppResponse } from './useAIWhatsAppResponse';
import { useAdvancedBotToggle } from './useAdvancedBotToggle';
import { useSentMessages } from './useSentMessages';
import { useToast } from './use-toast';

interface IncomingMessage {
  id: string;
  from_phone: string;
  customer_id?: string;
  message_content: string;
  timestamp: string;
}

export function useAutoResponse() {
  const { isAutoResponseEnabled } = useAdvancedBotToggle();
  const { generateAIResponse } = useAIWhatsAppResponse();
  const { saveSentMessage } = useSentMessages();
  const { toast } = useToast();
  const processedMessages = useRef(new Set<string>());

  useEffect(() => {
    if (!isAutoResponseEnabled) {
      console.log('🤖 Auto-response disabled, skipping subscription');
      return;
    }

    console.log('🤖 Setting up auto-response subscription...');

    const channel = supabase
      .channel('auto-response-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'incoming_messages'
        },
        async (payload) => {
          const newMessage = payload.new as IncomingMessage;
          
          console.log('🔔 New message received for auto-response:', {
            id: newMessage.id,
            from: newMessage.from_phone?.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2'),
            content: newMessage.message_content?.substring(0, 50) + '...'
          });

          // Evitar procesar el mismo mensaje múltiples veces
          if (processedMessages.current.has(newMessage.id)) {
            console.log('⏭️ Message already processed, skipping');
            return;
          }

          processedMessages.current.add(newMessage.id);

          // Verificar si el mensaje es del administrador (no auto-responder a admin)
          const adminPhone = '+573014940399'; // Número del admin
          if (newMessage.from_phone === adminPhone || newMessage.from_phone === '573014940399') {
            console.log('👨‍💼 Admin message detected, skipping auto-response');
            return;
          }

          try {
            console.log('🤖 Generating auto-response...');
            
            const aiResult = await generateAIResponse({
              message: newMessage.message_content,
              customerPhone: newMessage.from_phone,
              customerId: newMessage.customer_id
            });

            if (aiResult.response) {
              console.log('✅ Auto-response generated, sending...');
              
              // Enviar respuesta automática
              const { error } = await supabase.functions.invoke('send-whatsapp-notification', {
                body: {
                  phone: newMessage.from_phone,
                  message: aiResult.response,
                  customerId: newMessage.customer_id
                }
              });

              if (error) {
                console.error('❌ Error sending auto-response:', error);
                throw error;
              }

              // Guardar en sent_messages
              await saveSentMessage({
                customerId: newMessage.customer_id || null,
                phone: newMessage.from_phone,
                message: aiResult.response
              });

              console.log('🤖 Auto-response sent successfully');
              
              toast({
                title: "🤖 SARA respondió automáticamente",
                description: `Respuesta enviada a ${newMessage.from_phone?.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')}`,
              });
            }
          } catch (error: any) {
            console.error('❌ Error in auto-response:', error);
            
            // Si hay error, no mostrar toast para no molestar al usuario
            // El sistema de escalación se encargará si es necesario
          }
        }
      )
      .subscribe();

    return () => {
      console.log('🔄 Cleaning up auto-response subscription');
      supabase.removeChannel(channel);
    };
  }, [isAutoResponseEnabled, generateAIResponse, saveSentMessage, toast]);

  return {
    isAutoResponseEnabled
  };
}
