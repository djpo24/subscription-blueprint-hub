
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface WhatsAppErrorLog {
  id: string;
  notification_id: string;
  customer_id: string | null;
  package_id: string | null;
  notification_type: string;
  message: string;
  status: string;
  error_message: string | null;
  created_at: string;
  sent_at: string | null;
  customer_name?: string;
  customer_phone?: string;
  tracking_number?: string;
}

export function useWhatsAppErrorLogs() {
  const [errorLogs, setErrorLogs] = useState<WhatsAppErrorLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchWhatsAppErrorLogs = async () => {
    setIsLoading(true);
    console.log('🔍 Fetching WhatsApp error logs...');
    
    try {
      // Fetch failed notifications with customer and package info
      const { data: failedNotifications, error } = await supabase
        .from('notification_log')
        .select(`
          *,
          customers!customer_id(name, phone, whatsapp_number),
          packages!package_id(tracking_number)
        `)
        .eq('status', 'failed')
        .not('error_message', 'is', null)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('❌ Error fetching WhatsApp error logs:', error);
        throw error;
      }

      console.log(`📋 Found ${failedNotifications?.length || 0} WhatsApp error logs`);

      // Process the data to include customer info
      const processedLogs = failedNotifications?.map(notification => ({
        id: notification.id,
        notification_id: notification.id,
        customer_id: notification.customer_id,
        package_id: notification.package_id,
        notification_type: notification.notification_type || 'manual',
        message: notification.message || '',
        status: notification.status,
        error_message: notification.error_message,
        created_at: notification.created_at,
        sent_at: notification.sent_at,
        customer_name: notification.customers?.name || 'Cliente desconocido',
        customer_phone: notification.customers?.phone || notification.customers?.whatsapp_number || 'N/A',
        tracking_number: notification.packages?.tracking_number || null
      })) || [];

      setErrorLogs(processedLogs);
      
      if (processedLogs.length === 0) {
        console.log('✅ No WhatsApp errors found - good news!');
      } else {
        console.log(`📊 Processed ${processedLogs.length} WhatsApp error logs`);
      }
      
    } catch (error) {
      console.error('❌ Error fetching WhatsApp error logs:', error);
      toast({
        title: "Error",
        description: `No se pudieron cargar los logs de errores de WhatsApp: ${error.message}`,
        variant: "destructive"
      });
      setErrorLogs([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWhatsAppErrorLogs();
  }, []);

  return {
    errorLogs,
    isLoading,
    refetch: fetchWhatsAppErrorLogs
  };
}
