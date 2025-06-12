
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

interface AIResponseRequest {
  message: string;
  customerPhone: string;
  customerId: string | null; // Permitir null para clientes no registrados
}

export function useAIResponseProcessor() {
  const { toast } = useToast();

  const processAIResponse = useCallback(async ({ message, customerPhone, customerId }: AIResponseRequest): Promise<string> => {
    console.log('🤖 Processing AI response request:', { 
      customerPhone, 
      customerId: customerId || 'UNREGISTERED',
      isRegistered: !!customerId 
    });

    try {
      // Direct call to AI function
      console.log('📞 Calling ai-whatsapp-response function...');
      const { data: aiData, error: aiError } = await supabase.functions.invoke('ai-whatsapp-response', {
        body: {
          message,
          customerPhone,
          customerId: customerId || null // Pasar null explícitamente para clientes no registrados
        }
      });

      if (aiError) {
        console.error('❌ AI function error:', aiError);
        throw new Error(`AI function error: ${aiError.message}`);
      }

      if (aiData?.error) {
        console.error('❌ AI function returned error:', aiData.error);
        throw new Error(`AI response error: ${aiData.error}`);
      }

      const aiResponse = aiData?.response;
      if (!aiResponse) {
        throw new Error('No AI response received');
      }

      console.log('✅ AI response generated for', customerId ? 'registered customer' : 'unregistered customer', ':', aiResponse.substring(0, 100) + '...');
      return aiResponse;

    } catch (error) {
      console.error('❌ Error processing AI response:', error);
      
      // Return fallback response based on customer type
      const fallbackResponse = customerId 
        ? `¡Hola! 😊 Gracias por escribirnos. Un miembro de nuestro equipo te contactará pronto para ayudarte.`
        : `¡Hola! 😊 Somos Envíos Ojito. Gracias por contactarnos. Un miembro de nuestro equipo te contactará pronto para ayudarte con tus envíos.`;
      
      console.log('🔄 Using fallback response for', customerId ? 'registered' : 'unregistered', 'customer');
      
      return fallbackResponse;
    }
  }, []);

  return { processAIResponse };
}
