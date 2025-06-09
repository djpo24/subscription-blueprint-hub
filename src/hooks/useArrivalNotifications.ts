
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

export function useArrivalNotifications() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Obtener notificaciones pendientes de llegada
  const { data: pendingNotifications = [], isLoading } = useQuery({
    queryKey: ['arrival-notifications-pending'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notification_log')
        .select(`
          *,
          customers!fk_notification_log_customer (
            name,
            phone,
            whatsapp_number
          ),
          packages!fk_notification_log_package (
            tracking_number,
            destination,
            amount_to_collect,
            currency
          )
        `)
        .eq('notification_type', 'package_arrival')
        .eq('status', 'pending')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching pending notifications:', error);
        throw error;
      }

      return data || [];
    },
    refetchInterval: 30000, // Refrescar cada 30 segundos
  });

  // Función para generar el mensaje exacto según el formato requerido
  const generateArrivalMessage = (customerName: string, trackingNumber: string, destination: string, address: string, currency: string, amount: string) => {
    const currencySymbol = currency === 'AWG' ? 'ƒ' : '$';
    
    return `📦 Hola ${customerName},
 tu encomienda ${trackingNumber} ha llegado a ${destination}. 

📍 Ya puedes recogerla en la dirección: ${address}. 

💰 Te recordamos el valor a pagar: ${currencySymbol}${amount}.`;
  };

  // Procesar notificaciones pendientes
  const processNotificationsMutation = useMutation({
    mutationFn: async () => {
      console.log('🔄 Procesando notificaciones de llegada pendientes...');

      for (const notification of pendingNotifications) {
        try {
          const customerPhone = notification.customers?.whatsapp_number || notification.customers?.phone;
          
          if (!customerPhone) {
            console.warn(`⚠️ No hay teléfono para la notificación ${notification.id}`);
            continue;
          }

          // Obtener dirección del destino
          let address = 'nuestras oficinas';
          if (notification.packages?.destination) {
            const { data: destinationAddress } = await supabase
              .from('destination_addresses')
              .select('address')
              .ilike('city', notification.packages.destination)
              .limit(1)
              .single();
            
            if (destinationAddress) {
              address = destinationAddress.address;
            }
          }

          // Generar el mensaje exacto según el formato requerido
          const messageContent = generateArrivalMessage(
            notification.customers?.name || 'Cliente',
            notification.packages?.tracking_number || '',
            notification.packages?.destination || '',
            address,
            notification.packages?.currency || 'COP',
            notification.packages?.amount_to_collect?.toString() || '0'
          );

          console.log(`📱 Enviando notificación de llegada para ${notification.packages?.tracking_number}`);
          console.log('📝 Mensaje a enviar:', messageContent);

          // Actualizar el mensaje en notification_log para que coincida exactamente
          await supabase
            .from('notification_log')
            .update({ 
              message: messageContent,
              status: 'processing' 
            })
            .eq('id', notification.id);

          // Enviar notificación via WhatsApp con plantilla
          const { data: responseData, error: functionError } = await supabase.functions.invoke('send-whatsapp-notification', {
            body: {
              notificationId: notification.id,
              phone: customerPhone,
              message: messageContent,
              customerId: notification.customer_id,
              useTemplate: true,
              templateName: 'package_arrival_notification',
              templateLanguage: 'es_CO',
              templateParameters: {
                customerName: notification.customers?.name || 'Cliente',
                trackingNumber: notification.packages?.tracking_number || '',
                destination: notification.packages?.destination || '',
                address: address,
                currency: notification.packages?.currency === 'AWG' ? 'ƒ' : '$',
                amount: notification.packages?.amount_to_collect?.toString() || '0'
              }
            }
          });

          if (functionError) {
            console.error(`❌ Error enviando notificación ${notification.id}:`, functionError);
            
            // Marcar como fallido
            await supabase
              .from('notification_log')
              .update({ 
                status: 'failed',
                error_message: functionError.message
              })
              .eq('id', notification.id);
          } else if (responseData?.success) {
            console.log(`✅ Notificación ${notification.id} enviada exitosamente`);
            
            // Marcar como enviado
            await supabase
              .from('notification_log')
              .update({ 
                status: 'sent',
                sent_at: new Date().toISOString()
              })
              .eq('id', notification.id);
          }

        } catch (error: any) {
          console.error(`❌ Error procesando notificación ${notification.id}:`, error);
          
          // Marcar como fallido
          await supabase
            .from('notification_log')
            .update({ 
              status: 'failed',
              error_message: error.message
            })
            .eq('id', notification.id);
        }
      }

      return { processed: pendingNotifications.length };
    },
    onSuccess: (result) => {
      toast({
        title: "✅ Notificaciones procesadas",
        description: `Se procesaron ${result.processed} notificaciones de llegada`,
      });
      
      // Refrescar las queries
      queryClient.invalidateQueries({ queryKey: ['arrival-notifications-pending'] });
      queryClient.invalidateQueries({ queryKey: ['notification-log'] });
    },
    onError: (error: any) => {
      toast({
        title: "❌ Error procesando notificaciones",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  return {
    pendingNotifications,
    isLoading,
    processNotifications: () => processNotificationsMutation.mutateAsync(),
    isProcessing: processNotificationsMutation.isPending,
  };
}
