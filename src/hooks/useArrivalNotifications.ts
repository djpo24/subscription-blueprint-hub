
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { PendingNotification } from '@/types/supabase-temp';

interface ArrivalNotificationsResult {
  data: PendingNotification[];
  pendingNotifications: PendingNotification[];
  preparedNotifications: PendingNotification[];
  isLoading: boolean;
  prepareNotifications: () => void;
  executeNotifications: () => void;
  isPreparing: boolean;
  isExecuting: boolean;
}

export function useArrivalNotifications(): ArrivalNotificationsResult {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Obtener notificaciones de llegada (pendientes y preparadas)
  const query = useQuery({
    queryKey: ['arrival-notifications'],
    queryFn: async (): Promise<PendingNotification[]> => {
      console.log('🔍 Fetching arrival notifications...');
      
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
          .eq('notification_type', 'package_arrival')
          .in('status', ['pending', 'prepared'])
          .order('created_at', { ascending: false });

        if (error) {
          console.error('❌ Error fetching arrival notifications:', error);
          throw error;
        }

        console.log('✅ Arrival notifications fetched:', data?.length || 0);
        return data || [];
      } catch (error) {
        console.error('❌ Error in useArrivalNotifications:', error);
        return [];
      }
    },
    refetchInterval: 30000,
  });

  // Mutación para preparar notificaciones
  const prepareMutation = useMutation({
    mutationFn: async () => {
      console.log('📋 Preparing arrival notifications...');
      
      const { data, error } = await supabase.functions.invoke('process-arrival-notifications', {
        body: { mode: 'prepare' }
      });

      if (error) {
        console.error('❌ Error preparing notifications:', error);
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      console.log('✅ Notifications prepared successfully:', data);
      toast({
        title: "Notificaciones Preparadas",
        description: `${data.prepared} notificaciones preparadas para revisión`,
      });
      queryClient.invalidateQueries({ queryKey: ['arrival-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notification-log'] });
    },
    onError: (error: any) => {
      console.error('❌ Error preparing notifications:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudieron preparar las notificaciones",
        variant: "destructive"
      });
    }
  });

  // Mutación para ejecutar notificaciones preparadas
  const executeMutation = useMutation({
    mutationFn: async () => {
      console.log('🚀 Executing prepared notifications...');
      
      const { data, error } = await supabase.functions.invoke('process-arrival-notifications', {
        body: { mode: 'execute' }
      });

      if (error) {
        console.error('❌ Error executing notifications:', error);
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      console.log('✅ Notifications executed successfully:', data);
      toast({
        title: "Notificaciones Enviadas",
        description: `${data.executed} notificaciones enviadas exitosamente`,
      });
      queryClient.invalidateQueries({ queryKey: ['arrival-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notification-log'] });
      queryClient.invalidateQueries({ queryKey: ['sent-messages'] });
    },
    onError: (error: any) => {
      console.error('❌ Error executing notifications:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudieron enviar las notificaciones",
        variant: "destructive"
      });
    }
  });

  const allNotifications = query.data || [];
  const pendingNotifications = allNotifications.filter(n => n.status === 'pending');
  const preparedNotifications = allNotifications.filter(n => n.status === 'prepared');

  return {
    ...query,
    pendingNotifications,
    preparedNotifications,
    prepareNotifications: prepareMutation.mutate,
    executeNotifications: executeMutation.mutate,
    isPreparing: prepareMutation.isPending,
    isExecuting: executeMutation.isPending
  };
}
