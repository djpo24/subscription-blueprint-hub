
import { useEffect, useRef } from 'react';
import { useAdvancedBotToggle } from './useAdvancedBotToggle';
import { useAIWhatsAppResponse } from './useAIWhatsAppResponse';
import { useToast } from './use-toast';
import { supabase } from '@/integrations/supabase/client';

export function useAutoResponseDetection() {
  const { isAutoResponseEnabled } = useAdvancedBotToggle();
  const { generateAIResponse } = useAIWhatsAppResponse();
  const { toast } = useToast();
  const processedMessages = useRef(new Set<string>());
  const channelRef = useRef<any>(null);

  useEffect(() => {
    console.log('🤖 Auto-response detection effect triggered. Enabled:', isAutoResponseEnabled);

    // Limpiar canal anterior si existe
    if (channelRef.current) {
      console.log('🔕 Removing previous auto-response channel');
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    if (!isAutoResponseEnabled) {
      console.log('🤖 Auto responses disabled, skipping detection setup');
      return;
    }

    console.log('🤖 Setting up auto-response detection...');

    // Crear nuevo canal
    const channel = supabase
      .channel('auto-response-detection-' + Date.now())
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'incoming_messages'
        },
        async (payload) => {
          const newMessage = payload.new as any;
          console.log('🔔 New incoming message detected for auto-response:', {
            id: newMessage.id,
            from: newMessage.from_phone,
            customerId: newMessage.customer_id,
            message: newMessage.message_content?.substring(0, 50) + '...',
            timestamp: newMessage.timestamp
          });

          // Skip if already processed
          if (processedMessages.current.has(newMessage.id)) {
            console.log('⏭️ Message already processed, skipping');
            return;
          }

          // Skip if not from customer (avoid responding to our own messages)
          if (!newMessage.from_phone || !newMessage.customer_id) {
            console.log('⏭️ Message not from registered customer or missing phone, skipping auto-response');
            return;
          }

          // Mark as processed immediately to avoid duplicates
          processedMessages.current.add(newMessage.id);

          try {
            console.log('🤖 Starting AI response generation for:', {
              phone: newMessage.from_phone,
              customerId: newMessage.customer_id,
              message: newMessage.message_content?.substring(0, 100)
            });

            // LLAMADA DIRECTA A LA FUNCIÓN DE IA - CRÍTICO PARA EL CONSUMO DE OPENAI
            console.log('📞 Invoking ai-whatsapp-response function directly...');
            const { data: aiData, error: aiError } = await supabase.functions.invoke('ai-whatsapp-response', {
              body: {
                message: newMessage.message_content || '',
                customerPhone: newMessage.from_phone,
                customerId: newMessage.customer_id
              }
            });

            if (aiError) {
              console.error('❌ Error calling AI function:', aiError);
              throw new Error('Error al generar respuesta de IA: ' + aiError.message);
            }

            if (aiData.error) {
              console.error('❌ AI function returned error:', aiData.error);
              throw new Error('Error en función de IA: ' + aiData.error);
            }

            const aiResponse = aiData.response;
            console.log('✅ AI response generated successfully:', aiResponse?.substring(0, 100) + '...');

            // Send the response automatically using the notification system
            const { data: notificationData, error: logError } = await supabase
              .from('notification_log')
              .insert({
                package_id: null,
                customer_id: newMessage.customer_id,
                notification_type: 'auto_reply',
                message: aiResponse,
                status: 'pending'
              })
              .select()
              .single();

            if (logError) {
              console.error('❌ Error creating notification log:', logError);
              throw new Error('Error al crear registro de notificación automática');
            }

            console.log('📝 Notification log created:', notificationData.id);

            // Send via WhatsApp using the notification function
            console.log('📤 Sending WhatsApp notification...');
            const { data: responseData, error: functionError } = await supabase.functions.invoke('send-whatsapp-notification', {
              body: {
                notificationId: notificationData.id,
                phone: newMessage.from_phone,
                message: aiResponse,
                customerId: newMessage.customer_id
              }
            });

            if (functionError) {
              console.error('❌ WhatsApp function error:', functionError);
              throw new Error('Error al enviar respuesta automática por WhatsApp');
            }

            if (responseData && responseData.error) {
              console.error('❌ WhatsApp API error:', responseData.error);
              throw new Error('Error de WhatsApp: ' + responseData.error);
            }

            console.log('📤 Automatic response sent successfully to WhatsApp');

            toast({
              title: "🤖 Respuesta automática enviada",
              description: `SARA respondió automáticamente a ${newMessage.from_phone}`,
            });

          } catch (error) {
            console.error('❌ Error in automatic response:', error);
            
            // Send fallback response
            try {
              const fallbackMessage = "¡Hola! 😊 Gracias por escribirnos. Un miembro de nuestro equipo te contactará pronto para ayudarte.";
              
              console.log('🔄 Sending fallback response...');
              const { data: notificationData, error: logError } = await supabase
                .from('notification_log')
                .insert({
                  package_id: null,
                  customer_id: newMessage.customer_id,
                  notification_type: 'auto_reply_fallback',
                  message: fallbackMessage,
                  status: 'pending'
                })
                .select()
                .single();

              if (!logError) {
                await supabase.functions.invoke('send-whatsapp-notification', {
                  body: {
                    notificationId: notificationData.id,
                    phone: newMessage.from_phone,
                    message: fallbackMessage,
                    customerId: newMessage.customer_id
                  }
                });

                console.log('✅ Fallback response sent successfully');

                toast({
                  title: "🤖 Respuesta automática de emergencia",
                  description: "Se envió una respuesta básica debido a un error técnico",
                  variant: "default"
                });
              }
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
      .subscribe((status) => {
        console.log('🔔 Auto-response channel status:', status);
        if (status === 'SUBSCRIBED') {
          console.log('✅ Auto-response detection channel subscribed successfully');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Auto-response channel error');
        }
      });

    channelRef.current = channel;

    return () => {
      console.log('🔕 Cleanup: Unsubscribing from auto-response detection');
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [isAutoResponseEnabled, generateAIResponse, toast]);

  // Debug: Log current state
  useEffect(() => {
    console.log('🤖 Auto-response detection state:', {
      isAutoResponseEnabled,
      channelActive: !!channelRef.current,
      processedCount: processedMessages.current.size
    });
  }, [isAutoResponseEnabled]);

  return {
    isActive: isAutoResponseEnabled
  };
}
