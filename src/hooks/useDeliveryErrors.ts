
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DeliveryErrorCustomer {
  customer_id: string;
  customer_name: string;
  customer_phone: string;
  error_message: string;
  notification_type: string;
  failed_count: number;
  last_error_date: string;
  packages?: {
    tracking_number: string;
    destination: string;
  }[];
}

export function useDeliveryErrors() {
  const [errorCustomers, setErrorCustomers] = useState<DeliveryErrorCustomer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchDeliveryErrors = async () => {
    setIsLoading(true);
    try {
      // Obtener notificaciones fallidas desde notification_log
      const { data: failedNotifications, error: notificationError } = await supabase
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
            destination
          )
        `)
        .eq('status', 'failed')
        .order('created_at', { ascending: false });

      if (notificationError) {
        throw notificationError;
      }

      // Obtener errores de trip notifications
      const { data: failedTripNotifications, error: tripError } = await supabase
        .from('trip_notification_log')
        .select('*')
        .eq('status', 'failed')
        .order('created_at', { ascending: false });

      if (tripError) {
        throw tripError;
      }

      // Obtener errores de marketing campaigns
      const { data: failedMarketingMessages, error: marketingError } = await supabase
        .from('marketing_message_log')
        .select('*')
        .eq('status', 'failed')
        .order('created_at', { ascending: false });

      if (marketingError) {
        throw marketingError;
      }

      // Procesar y consolidar errores
      const customerErrorsMap = new Map<string, DeliveryErrorCustomer>();

      // Procesar notificaciones fallidas
      failedNotifications?.forEach(notification => {
        const customerId = notification.customer_id || 'unknown';
        const customerName = notification.customers?.name || 'Cliente desconocido';
        const customerPhone = notification.customers?.phone || notification.customers?.whatsapp_number || 'N/A';

        if (!customerErrorsMap.has(customerId)) {
          customerErrorsMap.set(customerId, {
            customer_id: customerId,
            customer_name: customerName,
            customer_phone: customerPhone,
            error_message: notification.error_message || 'Error desconocido',
            notification_type: notification.notification_type || 'manual',
            failed_count: 1,
            last_error_date: notification.created_at,
            packages: notification.packages ? [notification.packages] : []
          });
        } else {
          const existing = customerErrorsMap.get(customerId)!;
          existing.failed_count += 1;
          if (notification.created_at > existing.last_error_date) {
            existing.last_error_date = notification.created_at;
            existing.error_message = notification.error_message || existing.error_message;
          }
          if (notification.packages) {
            existing.packages?.push(notification.packages);
          }
        }
      });

      // Procesar trip notifications fallidas
      failedTripNotifications?.forEach(tripNotification => {
        const customerId = tripNotification.customer_id;
        const customerName = tripNotification.customer_name;
        const customerPhone = tripNotification.customer_phone;

        if (!customerErrorsMap.has(customerId)) {
          customerErrorsMap.set(customerId, {
            customer_id: customerId,
            customer_name: customerName,
            customer_phone: customerPhone,
            error_message: tripNotification.error_message || 'Error en notificación de viaje',
            notification_type: 'trip_notification',
            failed_count: 1,
            last_error_date: tripNotification.created_at,
            packages: []
          });
        } else {
          const existing = customerErrorsMap.get(customerId)!;
          existing.failed_count += 1;
          if (tripNotification.created_at > existing.last_error_date) {
            existing.last_error_date = tripNotification.created_at;
            existing.error_message = tripNotification.error_message || existing.error_message;
          }
        }
      });

      // Procesar marketing messages fallidos
      failedMarketingMessages?.forEach(marketingMessage => {
        const phoneKey = marketingMessage.customer_phone;
        const customerName = marketingMessage.customer_name || 'Cliente marketing';

        if (!customerErrorsMap.has(phoneKey)) {
          customerErrorsMap.set(phoneKey, {
            customer_id: phoneKey,
            customer_name: customerName,
            customer_phone: marketingMessage.customer_phone,
            error_message: marketingMessage.error_message || 'Error en campaña de marketing',
            notification_type: 'marketing_campaign',
            failed_count: 1,
            last_error_date: marketingMessage.created_at,
            packages: []
          });
        } else {
          const existing = customerErrorsMap.get(phoneKey)!;
          existing.failed_count += 1;
          if (marketingMessage.created_at > existing.last_error_date) {
            existing.last_error_date = marketingMessage.created_at;
            existing.error_message = marketingMessage.error_message || existing.error_message;
          }
        }
      });

      const errorsList = Array.from(customerErrorsMap.values())
        .sort((a, b) => new Date(b.last_error_date).getTime() - new Date(a.last_error_date).getTime());

      setErrorCustomers(errorsList);

      console.log(`📊 Encontrados ${errorsList.length} clientes con errores de entrega`);
      
    } catch (error) {
      console.error('Error fetching delivery errors:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los errores de entrega",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveryErrors();
  }, []);

  return {
    errorCustomers,
    isLoading,
    refetch: fetchDeliveryErrors
  };
}
