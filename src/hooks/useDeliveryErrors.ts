
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
    console.log('🔍 Iniciando búsqueda de errores de entrega...');
    
    try {
      // Primero verificar si las tablas existen y tienen datos
      console.log('📊 Verificando existencia de tablas y datos...');
      
      // Verificar notification_log
      const { data: allNotifications, error: allNotificationsError } = await supabase
        .from('notification_log')
        .select('id, status, created_at')
        .order('created_at', { ascending: false })
        .limit(10);

      if (allNotificationsError) {
        console.error('❌ Error al acceder a notification_log:', allNotificationsError);
      } else {
        console.log(`📋 Total registros en notification_log: ${allNotifications?.length || 0}`);
        console.log('📋 Últimas notificaciones:', allNotifications);
      }

      // Verificar trip_notification_log
      const { data: allTripNotifications, error: allTripNotificationsError } = await supabase
        .from('trip_notification_log')
        .select('id, status, created_at')
        .order('created_at', { ascending: false })
        .limit(10);

      if (allTripNotificationsError) {
        console.error('❌ Error al acceder a trip_notification_log:', allTripNotificationsError);
      } else {
        console.log(`🚗 Total registros en trip_notification_log: ${allTripNotifications?.length || 0}`);
        console.log('🚗 Últimas notificaciones de viaje:', allTripNotifications);
      }

      // Verificar marketing_message_log
      const { data: allMarketingMessages, error: allMarketingMessagesError } = await supabase
        .from('marketing_message_log')
        .select('id, status, created_at')
        .order('created_at', { ascending: false })
        .limit(10);

      if (allMarketingMessagesError) {
        console.error('❌ Error al acceder a marketing_message_log:', allMarketingMessagesError);
      } else {
        console.log(`📢 Total registros en marketing_message_log: ${allMarketingMessages?.length || 0}`);
        console.log('📢 Últimos mensajes de marketing:', allMarketingMessages);
      }

      // Ahora buscar específicamente errores
      console.log('🔍 Buscando registros con status = "failed"...');

      // Obtener notificaciones fallidas desde notification_log
      const { data: failedNotifications, error: notificationError } = await supabase
        .from('notification_log')
        .select('*')
        .eq('status', 'failed')
        .order('created_at', { ascending: false });

      if (notificationError) {
        console.error('❌ Error al obtener notification_log fallidas:', notificationError);
        throw notificationError;
      }

      console.log(`📋 Encontradas ${failedNotifications?.length || 0} notificaciones fallidas`);
      if (failedNotifications && failedNotifications.length > 0) {
        console.log('📋 Ejemplos de notificaciones fallidas:', failedNotifications.slice(0, 3));
      }

      // Obtener errores de trip notifications
      const { data: failedTripNotifications, error: tripError } = await supabase
        .from('trip_notification_log')
        .select('*')
        .eq('status', 'failed')
        .order('created_at', { ascending: false });

      if (tripError) {
        console.error('❌ Error al obtener trip_notification_log fallidas:', tripError);
        throw tripError;
      }

      console.log(`🚗 Encontradas ${failedTripNotifications?.length || 0} notificaciones de viaje fallidas`);
      if (failedTripNotifications && failedTripNotifications.length > 0) {
        console.log('🚗 Ejemplos de notificaciones de viaje fallidas:', failedTripNotifications.slice(0, 3));
      }

      // Obtener errores de marketing campaigns
      const { data: failedMarketingMessages, error: marketingError } = await supabase
        .from('marketing_message_log')
        .select('*')
        .eq('status', 'failed')
        .order('created_at', { ascending: false });

      if (marketingError) {
        console.error('❌ Error al obtener marketing_message_log fallidos:', marketingError);
        throw marketingError;
      }

      console.log(`📢 Encontrados ${failedMarketingMessages?.length || 0} mensajes de marketing fallidos`);
      if (failedMarketingMessages && failedMarketingMessages.length > 0) {
        console.log('📢 Ejemplos de mensajes de marketing fallidos:', failedMarketingMessages.slice(0, 3));
      }

      // Procesar y consolidar errores
      const customerErrorsMap = new Map<string, DeliveryErrorCustomer>();
      let totalProcessed = 0;

      // Procesar notificaciones fallidas
      if (failedNotifications && failedNotifications.length > 0) {
        console.log('🔄 Procesando notificaciones fallidas...');
        for (const notification of failedNotifications) {
          totalProcessed++;
          const customerId = notification.customer_id || 'unknown';
          let customerName = 'Cliente desconocido';
          let customerPhone = 'N/A';

          // Obtener información del cliente si existe customer_id
          if (notification.customer_id) {
            try {
              const { data: customer, error: customerError } = await supabase
                .from('customers')
                .select('name, phone, whatsapp_number')
                .eq('id', notification.customer_id)
                .single();

              if (!customerError && customer) {
                customerName = customer.name || 'Cliente desconocido';
                customerPhone = customer.phone || customer.whatsapp_number || 'N/A';
              }
            } catch (customerError) {
              console.log('No se pudo obtener info del cliente:', customerError);
            }
          }

          // Obtener información del paquete si existe package_id
          let packageInfo = null;
          if (notification.package_id) {
            try {
              const { data: pkg, error: packageError } = await supabase
                .from('packages')
                .select('tracking_number, destination')
                .eq('id', notification.package_id)
                .single();

              if (!packageError && pkg) {
                packageInfo = pkg;
              }
            } catch (packageError) {
              console.log('No se pudo obtener info del paquete:', packageError);
            }
          }

          const errorKey = `${customerId}-${customerPhone}`;
          
          if (!customerErrorsMap.has(errorKey)) {
            customerErrorsMap.set(errorKey, {
              customer_id: customerId,
              customer_name: customerName,
              customer_phone: customerPhone,
              error_message: notification.error_message || 'Error desconocido',
              notification_type: notification.notification_type || 'manual',
              failed_count: 1,
              last_error_date: notification.created_at,
              packages: packageInfo ? [packageInfo] : []
            });
          } else {
            const existing = customerErrorsMap.get(errorKey)!;
            existing.failed_count += 1;
            if (notification.created_at > existing.last_error_date) {
              existing.last_error_date = notification.created_at;
              existing.error_message = notification.error_message || existing.error_message;
            }
            if (packageInfo) {
              existing.packages?.push(packageInfo);
            }
          }
        }
      }

      // Procesar trip notifications fallidas
      if (failedTripNotifications && failedTripNotifications.length > 0) {
        for (const tripNotification of failedTripNotifications) {
          const customerId = tripNotification.customer_id;
          const customerName = tripNotification.customer_name;
          const customerPhone = tripNotification.customer_phone;
          const errorKey = `${customerId}-${customerPhone}`;

          if (!customerErrorsMap.has(errorKey)) {
            customerErrorsMap.set(errorKey, {
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
            const existing = customerErrorsMap.get(errorKey)!;
            existing.failed_count += 1;
            if (tripNotification.created_at > existing.last_error_date) {
              existing.last_error_date = tripNotification.created_at;
              existing.error_message = tripNotification.error_message || existing.error_message;
            }
          }
        }
      }

      // Procesar marketing messages fallidos
      if (failedMarketingMessages && failedMarketingMessages.length > 0) {
        for (const marketingMessage of failedMarketingMessages) {
          const phoneKey = marketingMessage.customer_phone;
          const customerName = marketingMessage.customer_name || 'Cliente marketing';
          const errorKey = `marketing-${phoneKey}`;

          if (!customerErrorsMap.has(errorKey)) {
            customerErrorsMap.set(errorKey, {
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
            const existing = customerErrorsMap.get(errorKey)!;
            existing.failed_count += 1;
            if (marketingMessage.created_at > existing.last_error_date) {
              existing.last_error_date = marketingMessage.created_at;
              existing.error_message = marketingMessage.error_message || existing.error_message;
            }
          }
        }
      }

      const errorsList = Array.from(customerErrorsMap.values())
        .sort((a, b) => new Date(b.last_error_date).getTime() - new Date(a.last_error_date).getTime());

      console.log(`📊 Resumen de procesamiento:`);
      console.log(`   - Total registros procesados: ${totalProcessed}`);
      console.log(`   - Clientes únicos con errores: ${errorsList.length}`);
      console.log(`   - Mapa de errores generado:`, customerErrorsMap);

      setErrorCustomers(errorsList);

      if (errorsList.length === 0) {
        console.log('✅ No se encontraron errores de entrega - esto podría ser correcto');
        toast({
          title: "Sin errores",
          description: "No se encontraron errores de entrega en el sistema",
        });
      } else {
        console.log(`✅ Se encontraron ${errorsList.length} clientes con errores de entrega`);
        toast({
          title: "Errores encontrados",
          description: `Se encontraron ${errorsList.length} clientes con errores de entrega`,
        });
      }
      
    } catch (error) {
      console.error('❌ Error completo al obtener errores de entrega:', error);
      console.error('❌ Stack trace:', error.stack);
      toast({
        title: "Error",
        description: `No se pudieron cargar los errores de entrega: ${error.message}`,
        variant: "destructive"
      });
      setErrorCustomers([]);
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
