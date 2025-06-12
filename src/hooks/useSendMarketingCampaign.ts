
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useSendMarketingCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('send-marketing-campaign');

      if (error) {
        console.error('Error sending marketing campaign:', error);
        throw new Error(error.message || 'Error al enviar la campaña');
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketing-campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['marketing-stats'] });
    }
  });
}
