
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
      const { data: notifications, error } = await supabase
        .from('notification_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      
      // Fetch related data separately
      const notificationsWithDetails = await Promise.all(
        (notifications || []).map(async (notification) => {
          const details: NotificationLogEntry = {
            ...notification,
            packages: undefined,
            customers: undefined
          };
          
          // Get package details if package_id exists
          if (notification.package_id) {
            const { data: packageData } = await supabase
              .from('packages')
              .select('tracking_number')
              .eq('id', notification.package_id)
              .single();
            
            if (packageData) {
              details.packages = { tracking_number: packageData.tracking_number };
            }
          }
          
          // Get customer details if customer_id exists
          if (notification.customer_id) {
            const { data: customerData } = await supabase
              .from('customers')
              .select('name, phone')
              .eq('id', notification.customer_id)
              .single();
            
            if (customerData) {
              details.customers = { name: customerData.name, phone: customerData.phone };
            }
          }
          
          return details;
        })
      );
      
      return notificationsWithDetails;
    }
  });
}
