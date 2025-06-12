
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface MarketingStats {
  totalContacts: number;
  activeContacts: number;
  totalCampaigns: number;
  totalMessagesSent: number;
  successRate: number;
  daysSinceLastCampaign: number;
}

export function useMarketingStats() {
  return useQuery({
    queryKey: ['marketing-stats'],
    queryFn: async (): Promise<MarketingStats> => {
      // Obtener estadísticas de contactos
      const { data: contactsData } = await supabase
        .from('marketing_contacts')
        .select('id, is_active');

      const totalContacts = contactsData?.length || 0;
      const activeContacts = contactsData?.filter(c => c.is_active)?.length || 0;

      // Obtener estadísticas de campañas
      const { data: campaignsData } = await supabase
        .from('marketing_campaigns')
        .select('id, sent_at, total_messages_sent, success_count, failed_count')
        .gte('sent_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString());

      const totalCampaigns = campaignsData?.length || 0;
      const totalMessagesSent = campaignsData?.reduce((sum, c) => sum + (c.total_messages_sent || 0), 0) || 0;
      const totalSuccessful = campaignsData?.reduce((sum, c) => sum + (c.success_count || 0), 0) || 0;
      const successRate = totalMessagesSent > 0 ? Math.round((totalSuccessful / totalMessagesSent) * 100) : 0;

      // Obtener última campaña
      const { data: lastCampaign } = await supabase
        .from('marketing_campaigns')
        .select('sent_at')
        .order('sent_at', { ascending: false })
        .limit(1)
        .single();

      let daysSinceLastCampaign = 0;
      if (lastCampaign?.sent_at) {
        const lastDate = new Date(lastCampaign.sent_at);
        const today = new Date();
        daysSinceLastCampaign = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
      }

      return {
        totalContacts,
        activeContacts,
        totalCampaigns,
        totalMessagesSent,
        successRate,
        daysSinceLastCampaign
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}
