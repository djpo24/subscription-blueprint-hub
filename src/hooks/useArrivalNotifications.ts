
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

interface PendingNotification {
  id: string;
  customer_id: string;
  package_id: string | null;
  message: string;
  created_at: string;
  customers?: {
    name: string;
    phone: string;
    whatsapp_number: string;
  };
  packages?: {
    tracking_number: string;
    destination: string;
    amount_to_collect: number;
    currency: string;
  };
}

export function useArrivalNotifications() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: pendingNotifications = [], isLoading } = useQuery({
    queryKey: ['pending-arrival-notifications'],
    queryFn: async (): Promise<PendingNotification[]> => {
      console.log('Fetching pending arrival notifications...');
      
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

      console.log('Pending notifications fetched:', data?.length || 0);
      return data || [];
    },
    refetchInterval: 30000, // Refrescar cada 30 segundos
  });

  const processNotificationsMutation = useMutation({
    mutationFn: async () => {
      console.log('🔄 Procesando notificaciones de llegada automáticamente...');
      
      const { data, error } = await supabase.functions.invoke('process-arrival-notifications');

      if (error) {
        console.error('Error processing notifications:', error);
        throw error;
      }

      console.log('Process notifications result:', data);
      return data;
    },
    onSuccess: (result) => {
      toast({
        title: "✅ Procesamiento completado",
        description: `${result.processed || 0} notificaciones enviadas, ${result.errors || 0} errores`,
      });
      
      // Refrescar todas las queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['pending-arrival-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notification-log'] });
      queryClient.invalidateQueries({ queryKey: ['chat-messages'] });
      queryClient.invalidateQueries({ queryKey: ['sent-messages'] }); // Refrescar mensajes enviados
    },
    onError: (error: any) => {
      console.error('Error processing notifications:', error);
      toast({
        title: "❌ Error en procesamiento",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  return {
    pendingNotifications,
    isLoading,
    processNotifications: processNotificationsMutation.mutateAsync,
    isProcessing: processNotificationsMutation.isPending
  };
}
