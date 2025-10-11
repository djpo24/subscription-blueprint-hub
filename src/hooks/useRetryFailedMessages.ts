import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useRetryFailedMessages() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ campaignId, messageIds }: { campaignId: string; messageIds: string[] }) => {
      console.log('🔄 Retrying failed messages:', { campaignId, messageIds });

      const { data, error } = await supabase.functions.invoke('retry-failed-messages', {
        body: { campaignId, messageIds }
      });

      if (error) {
        console.error('❌ Error retrying messages:', error);
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      console.log('✅ Messages retry completed:', data);
      toast({
        title: "Reintento completado",
        description: `${data.successCount} mensajes enviados exitosamente, ${data.failedCount} fallidos`,
      });
      queryClient.invalidateQueries({ queryKey: ['campaign-failed-messages'] });
      queryClient.invalidateQueries({ queryKey: ['marketing-campaigns'] });
    },
    onError: (error: any) => {
      console.error('❌ Error retrying messages:', error);
      toast({
        title: "Error al reintentar mensajes",
        description: error.message || "Ha ocurrido un error inesperado",
        variant: "destructive"
      });
    }
  });
}
