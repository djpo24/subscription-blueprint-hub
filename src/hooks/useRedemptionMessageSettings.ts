import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useRedemptionMessageSettings() {
  return useQuery({
    queryKey: ['redemption-message-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('redemption_message_settings')
        .select('*')
        .single();

      if (error) {
        console.error('Error fetching redemption message settings:', error);
        throw error;
      }

      return data;
    },
  });
}
