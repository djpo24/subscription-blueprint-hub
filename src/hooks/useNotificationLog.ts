
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface NotificationLogEntry {
  id: string;
  package_id: string;
  customer_id: string;
  notification_type: string;
  message: string;
  status: string;
  sent_at: string | null;
  error_message: string | null;
  created_at: string;
  packages?: {
    tracking_number: string;
  };
  customers?: {
    name: string;
    phone: string;
  };
}

export function useNotificationLog() {
  return useQuery({
    queryKey: ['notification-log'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notification_log')
        .select(`
          *,
          packages (
            tracking_number
          ),
          customers (
            name,
            phone
          )
        `)
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data as NotificationLogEntry[];
    }
  });
}
