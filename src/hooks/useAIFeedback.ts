
import { useMutation, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AIFeedbackData {
  interactionId: string;
  feedbackType: 'positive' | 'negative' | 'neutral';
  feedbackSource: 'user_reaction' | 'agent_rating' | 'auto_detected';
  feedbackDetails?: any;
  agentNotes?: string;
}

interface AIInteraction {
  id: string;
  customer_phone: string;
  user_message: string;
  ai_response: string;
  context_info: any;
  response_time_ms: number;
  was_fallback: boolean;
  created_at: string;
}

export function useAIFeedback() {
  const { toast } = useToast();

  const submitFeedbackMutation = useMutation({
    mutationFn: async (feedbackData: AIFeedbackData) => {
      const { error } = await supabase
        .from('ai_response_feedback')
        .insert({
          interaction_id: feedbackData.interactionId,
          feedback_type: feedbackData.feedbackType,
          feedback_source: feedbackData.feedbackSource,
          feedback_details: feedbackData.feedbackDetails || null,
          agent_notes: feedbackData.agentNotes || null
        });

      if (error) {
        throw new Error('Error al enviar feedback: ' + error.message);
      }

      return true;
    },
    onSuccess: () => {
      toast({
        title: "Feedback enviado",
        description: "Gracias por tu feedback. Nos ayuda a mejorar las respuestas automáticas.",
      });
    },
    onError: (error: any) => {
      console.error('Error submitting feedback:', error);
      toast({
        title: "Error",
        description: "No se pudo enviar el feedback. Inténtalo de nuevo.",
        variant: "destructive"
      });
    }
  });

  return {
    submitFeedback: submitFeedbackMutation.mutateAsync,
    isSubmittingFeedback: submitFeedbackMutation.isPending
  };
}

export function useAIInteractions(limit = 50) {
  return useQuery({
    queryKey: ['ai-interactions', limit],
    queryFn: async (): Promise<AIInteraction[]> => {
      const { data, error } = await supabase
        .from('ai_chat_interactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw new Error('Error al cargar interacciones: ' + error.message);
      }

      return data || [];
    }
  });
}

export function useAIInteractionFeedback(interactionId: string) {
  return useQuery({
    queryKey: ['ai-interaction-feedback', interactionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ai_response_feedback')
        .select('*')
        .eq('interaction_id', interactionId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error('Error al cargar feedback: ' + error.message);
      }

      return data || [];
    },
    enabled: !!interactionId
  });
}
