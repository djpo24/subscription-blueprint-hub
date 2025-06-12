
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface UpdateMarketingSettingsParams {
  messageFrequencyDays: number;
  tripWindowDays: number;
  autoSendEnabled: boolean;
  messageTemplate: string;
}

export function useUpdateMarketingSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: UpdateMarketingSettingsParams) => {
      const { data, error } = await supabase
        .from('marketing_settings')
        .update({
          message_frequency_days: params.messageFrequencyDays,
          trip_window_days: params.tripWindowDays,
          auto_send_enabled: params.autoSendEnabled,
          message_template: params.messageTemplate,
          updated_at: new Date().toISOString()
        })
        .eq('id', (await supabase.from('marketing_settings').select('id').limit(1).single()).data?.id);

      if (error) {
        console.error('Error updating marketing settings:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketing-settings'] });
    }
  });
}
