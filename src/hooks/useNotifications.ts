
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useNotifications() {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      console.log('🔍 Fetching notifications...');
      
      const { data, error } = await supabase
        .from('notification_log')
        .select(`
          *,
          customers!fk_notification_log_customer(name, phone, whatsapp_number),
          packages!fk_notification_log_package(tracking_number, destination, amount_to_collect, currency)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('❌ Error fetching notifications:', error);
        throw error;
      }

      console.log('✅ Notifications fetched:', data?.length || 0, 'notifications');
      return data || [];
    },
    onError: (error: any) => {
      console.error('❌ Error in useNotifications:', error);
    }
  });
}
