
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useNotifications() {
  const { toast } = useToast();

  const sendManualNotificationMutation = useMutation({
    mutationFn: async ({ 
      customerId, 
      packageId, 
      message, 
      phone 
    }: { 
      customerId: string;
      packageId: string;
      message: string;
      phone: string;
    }) => {
      // First, create the notification log entry
      const { data: notificationData, error: logError } = await supabase
        .from('notification_log')
        .insert({
          package_id: packageId || null,
          customer_id: customerId,
          notification_type: 'manual',
          message: message,
          status: 'pending'
        })
        .select()
        .single();

      if (logError) throw logError;

      // Then send the WhatsApp notification
      const response = await supabase.functions.invoke('send-whatsapp-notification', {
        body: {
          notificationId: notificationData.id,
          phone: phone,
          message: message
        }
      });

      if (response.error) throw response.error;
      
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: "Notificación enviada",
        description: "La notificación se envió correctamente por WhatsApp",
      });
    },
    onError: (error: any) => {
      console.error('Error sending manual notification:', error);
      toast({
        title: "Error",
        description: "No se pudo enviar la notificación",
        variant: "destructive"
      });
    }
  });

  const sendPackageStatusNotificationMutation = useMutation({
    mutationFn: async ({ 
      packageId, 
      status 
    }: { 
      packageId: string;
      status: string;
    }) => {
      // Get package and customer information
      const { data: packageData, error: packageError } = await supabase
        .from('packages')
        .select(`
          *,
          customers (
            name,
            phone,
            whatsapp_number
          )
        `)
        .eq('id', packageId)
        .single();

      if (packageError) throw packageError;

      const customer = packageData.customers;
      const phone = customer?.whatsapp_number || customer?.phone;

      if (!phone) {
        throw new Error('No se encontró número de teléfono para el cliente');
      }

      // Create appropriate message based on status
      let message = '';
      switch (status) {
        case 'in_transit':
          message = `Su encomienda ${packageData.tracking_number} está en tránsito hacia ${packageData.destination}.`;
          break;
        case 'arrived':
          message = `¡Su encomienda ${packageData.tracking_number} ha llegado a ${packageData.destination}! Ya puede recogerla en nuestras oficinas.`;
          break;
        case 'delivered':
          message = `Su encomienda ${packageData.tracking_number} ha sido entregada exitosamente. ¡Gracias por confiar en Envíos Ojitos!`;
          break;
        default:
          message = `Actualización de su encomienda ${packageData.tracking_number}: ${status}`;
      }

      // Create notification log entry
      const { data: notificationData, error: logError } = await supabase
        .from('notification_log')
        .insert({
          package_id: packageId,
          customer_id: packageData.customer_id,
          notification_type: 'status_update',
          message: message,
          status: 'pending'
        })
        .select()
        .single();

      if (logError) throw logError;

      // Send WhatsApp notification
      const response = await supabase.functions.invoke('send-whatsapp-notification', {
        body: {
          notificationId: notificationData.id,
          phone: phone,
          message: message
        }
      });

      if (response.error) throw response.error;
      
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: "Notificación de estado enviada",
        description: "Se notificó al cliente sobre el cambio de estado",
      });
    },
    onError: (error: any) => {
      console.error('Error sending status notification:', error);
      toast({
        title: "Error",
        description: "No se pudo enviar la notificación de estado",
        variant: "destructive"
      });
    }
  });

  return {
    sendManualNotification: sendManualNotificationMutation.mutate,
    sendPackageStatusNotification: sendPackageStatusNotificationMutation.mutate,
    isManualSending: sendManualNotificationMutation.isPending,
    isStatusSending: sendPackageStatusNotificationMutation.isPending,
  };
}
