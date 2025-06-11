
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { NotificationLogEntry } from '@/types/supabase-temp';

export function useNotificationLog() {
  return useQuery({
    queryKey: ['notification-log'],
    queryFn: async (): Promise<NotificationLogEntry[]> => {
      console.log('🔍 Fetching notification log...');
      
      try {
        const { data, error } = await supabase
          .from('notification_log')
          .select(`
            *,
            customers!customer_id (
              name,
              phone,
              whatsapp_number
            ),
            packages!package_id (
              tracking_number,
              destination,
              amount_to_collect,
              currency
            )
          `)
          .order('created_at', { ascending: false })
          .limit(100);

        if (error) {
          console.error('❌ Error fetching notification log:', error);
          throw error;
        }

        return (data || []).map(log => ({
          id: log.id,
          customer_id: log.customer_id,
          package_id: log.package_id,
          message: log.message,
          status: log.status,
          created_at: log.created_at,
          sent_at: log.sent_at,
          notification_type: 'whatsapp', // Default type
          error_message: undefined,
          customers: log.customers,
          packages: log.packages
        }));
      } catch (error) {
        console.error('❌ Error in useNotificationLog:', error);
        return [];
      }
    },
    refetchInterval: 30000,
  });
}
