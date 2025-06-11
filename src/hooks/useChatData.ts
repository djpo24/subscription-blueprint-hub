
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { IncomingMessage } from '@/types/supabase-temp';

export function useChatData() {
  return useQuery({
    queryKey: ['chat-data'],
    queryFn: async (): Promise<IncomingMessage[]> => {
      console.log('🔍 Fetching chat data...');
      
      try {
        const { data, error } = await supabase
          .from('incoming_messages')
          .select(`
            *,
            customers (
              name
            )
          `)
          .order('timestamp', { ascending: false })
          .limit(50);

        if (error) {
          console.error('❌ Error fetching chat data:', error);
          throw error;
        }

        return (data || []).map(msg => ({
          id: msg.id,
          whatsapp_message_id: msg.whatsapp_message_id,
          from_phone: msg.from_phone,
          customer_id: msg.customer_id,
          message_type: msg.message_type,
          message_content: msg.message_content,
          media_url: msg.media_url,
          timestamp: msg.timestamp,
          customers: msg.customers
        }));
      } catch (error) {
        console.error('❌ Error in useChatData:', error);
        return [];
      }
    },
    refetchInterval: 5000,
  });
}
