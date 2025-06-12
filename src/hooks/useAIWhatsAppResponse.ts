
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AIResponseRequest {
  message: string;
  customerPhone: string;
  customerId?: string;
}

interface CustomerInfo {
  found: boolean;
  name: string;
  pendingAmount: number;
  pendingPackages: number;
  transitPackages: number;
}

interface AIResponseResult {
  response: string;
  hasPackageInfo: boolean;
  isFromFallback?: boolean;
  customerInfo?: CustomerInfo;
  interactionId?: string;
}

export function useAIWhatsAppResponse() {
  const { toast } = useToast();

  const generateResponseMutation = useMutation({
    mutationFn: async ({ message, customerPhone, customerId }: AIResponseRequest): Promise<AIResponseResult> => {
      console.log('🤖 Generating enhanced AI response for:', { message, customerPhone, customerId });
      
      const { data, error } = await supabase.functions.invoke('ai-whatsapp-response', {
        body: {
          message,
          customerPhone,
          customerId
        }
      });

      if (error) {
        console.error('❌ Error generating AI response:', error);
        throw new Error('Error al generar respuesta automática: ' + error.message);
      }

      if (data.error) {
        console.error('❌ AI response function error:', data.error);
        
        // Check if it's a rate limit error and provide user-friendly message
        if (data.error.includes('RATE_LIMIT') || data.error.includes('Too Many Requests')) {
          toast({
            title: "Sistema ocupado",
            description: "El sistema automático está experimentando alta demanda. SARA ha generado una respuesta personalizada.",
            variant: "default"
          });
        }
        
        // Return the fallback response instead of throwing
        return {
          response: data.response || "Un miembro de nuestro equipo te contactará pronto para ayudarte.",
          hasPackageInfo: data.hasPackageInfo || false,
          isFromFallback: true,
          customerInfo: data.customerInfo
        };
      }

      console.log('✅ Enhanced AI response generated:', {
        hasPackageInfo: data.hasPackageInfo,
        isFromFallback: data.isFromFallback,
        customerFound: data.customerInfo?.found,
        hasLearningContext: !!data.interactionId
      });
      
      // Show success message with enhanced context
      if (data.customerInfo?.found) {
        const { customerInfo } = data;
        let statusMessage = `Respuesta personalizada generada para ${customerInfo.name}`;
        
        if (customerInfo.pendingAmount > 0) {
          statusMessage += ` - Saldo pendiente: $${customerInfo.pendingAmount.toLocaleString()}`;
        }
        
        if (customerInfo.transitPackages > 0) {
          statusMessage += ` - ${customerInfo.transitPackages} encomienda(s) en tránsito`;
        }
        
        toast({
          title: "🤖 SARA responde con inteligencia mejorada",
          description: statusMessage,
        });
      } else {
        toast({
          title: "🤖 SARA responde naturalmente",
          description: data.isFromFallback 
            ? "Respuesta de emergencia generada con toque humano" 
            : "Respuesta automática con aprendizaje continuo",
        });
      }

      return {
        response: data.response,
        hasPackageInfo: data.hasPackageInfo || false,
        isFromFallback: data.isFromFallback || false,
        customerInfo: data.customerInfo,
        interactionId: data.interactionId
      };
    },
    onError: (error: any) => {
      console.error('❌ Error in enhanced AI response generation:', error);
      toast({
        title: "Error en respuesta de SARA",
        description: "Se ha generado una respuesta de emergencia. Nuestro equipo te contactará pronto.",
        variant: "destructive"
      });
    }
  });

  return {
    generateAIResponse: generateResponseMutation.mutateAsync,
    isGenerating: generateResponseMutation.isPending
  };
}
