import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useCampaignFailedMessages(campaignId: string | null) {
  return useQuery({
    queryKey: ['campaign-failed-messages', campaignId],
    queryFn: async () => {
      if (!campaignId) return [];

      const { data, error } = await supabase
        .from('marketing_message_log')
        .select('*')
        .eq('campaign_id', campaignId)
        .eq('status', 'failed')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching failed messages:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!campaignId,
    staleTime: 30 * 1000, // 30 segundos
  });
}
