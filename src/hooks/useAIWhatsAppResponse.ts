
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
      console.log('🤖 Generating AI response for:', { message, customerPhone, customerId });
      
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
            description: "El sistema automático está experimentando alta demanda. Se ha generado una respuesta personalizada.",
            variant: "default"
          });
        }
        
        // Return the fallback response instead of throwing
        return {
          response: data.response || "Un agente te contactará pronto para ayudarte.",
          hasPackageInfo: data.hasPackageInfo || false,
          isFromFallback: true,
          customerInfo: data.customerInfo
        };
      }

      console.log('✅ AI response generated:', {
        hasPackageInfo: data.hasPackageInfo,
        isFromFallback: data.isFromFallback,
        customerFound: data.customerInfo?.found
      });
      
      // Show success message with customer info if available
      if (data.customerInfo?.found) {
        const { customerInfo } = data;
        let statusMessage = `Respuesta generada para ${customerInfo.name}`;
        
        if (customerInfo.pendingAmount > 0) {
          statusMessage += ` - Saldo pendiente: $${customerInfo.pendingAmount.toLocaleString()}`;
        }
        
        if (customerInfo.transitPackages > 0) {
          statusMessage += ` - ${customerInfo.transitPackages} encomienda(s) en tránsito`;
        }
        
        toast({
          title: "🤖 Respuesta personalizada generada",
          description: statusMessage,
        });
      } else {
        toast({
          title: "🤖 Respuesta generada",
          description: data.isFromFallback 
            ? "Respuesta de emergencia generada" 
            : "Respuesta automática generada",
        });
      }

      return {
        response: data.response,
        hasPackageInfo: data.hasPackageInfo || false,
        isFromFallback: data.isFromFallback || false,
        customerInfo: data.customerInfo
      };
    },
    onError: (error: any) => {
      console.error('❌ Error in AI response generation:', error);
      toast({
        title: "Error en respuesta automática",
        description: "Se ha generado una respuesta de emergencia. Un agente te contactará pronto.",
        variant: "destructive"
      });
    }
  });

  return {
    generateAIResponse: generateResponseMutation.mutateAsync,
    isGenerating: generateResponseMutation.isPending
  };
}
