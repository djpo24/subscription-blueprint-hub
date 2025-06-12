
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AIResponseRequest {
  message: string;
  customerPhone: string;
  customerId?: string;
}

interface AIResponseResult {
  response: string;
  hasPackageInfo: boolean;
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
        throw new Error(data.error);
      }

      console.log('✅ AI response generated:', data.response);
      return {
        response: data.response,
        hasPackageInfo: data.hasPackageInfo || false
      };
    },
    onError: (error: any) => {
      console.error('❌ Error in AI response generation:', error);
      toast({
        title: "Error en respuesta automática",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  return {
    generateAIResponse: generateResponseMutation.mutateAsync,
    isGenerating: generateResponseMutation.isPending
  };
}
