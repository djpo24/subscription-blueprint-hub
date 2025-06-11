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
  clearPreparedNotifications: () => void;
  isPreparing: boolean;
  isExecuting: boolean;
  isClearing: boolean;
}

export function useArrivalNotifications(): ArrivalNotificationsResult {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Obtener notificaciones de llegada con datos del cliente SIEMPRE ACTUALIZADOS
  const query = useQuery({
    queryKey: ['arrival-notifications'],
    queryFn: async (): Promise<PendingNotification[]> => {
      console.log('🔍 Fetching arrival notifications with FRESH customer data...');
      
      try {
        // Primero obtenemos las notificaciones básicas
        const { data: notifications, error: notificationsError } = await supabase
          .from('notification_log')
          .select(`
            *,
            packages!notification_log_package_id_fkey (
              tracking_number,
              destination,
              amount_to_collect,
              currency,
              updated_at,
              customer_id
            )
          `)
          .eq('notification_type', 'package_arrival')
          .in('status', ['pending', 'prepared'])
          .order('created_at', { ascending: false });

        if (notificationsError) {
          console.error('❌ Error fetching notifications:', notificationsError);
          throw notificationsError;
        }

        if (!notifications || notifications.length === 0) {
          console.log('ℹ️ No arrival notifications found');
          return [];
        }

        // Ahora para cada notificación, obtenemos los datos FRESCOS del cliente
        const enrichedNotifications = await Promise.all(
          notifications.map(async (notification) => {
            if (!notification.customer_id) {
              console.warn(`⚠️ Notification ${notification.id} has no customer_id`);
              return null;
            }

            // Consulta FRESCA de los datos del cliente
            const { data: customerData, error: customerError } = await supabase
              .from('customers')
              .select('name, phone, whatsapp_number, updated_at')
              .eq('id', notification.customer_id)
              .single();

            if (customerError) {
              console.error(`❌ Error fetching fresh customer data for ${notification.customer_id}:`, customerError);
              return null;
            }

            if (!customerData) {
              console.warn(`⚠️ No customer data found for ${notification.customer_id}`);
              return null;
            }

            // Verificar que el cliente tiene un número válido
            const hasValidPhone = customerData.whatsapp_number?.trim() || customerData.phone?.trim();
            if (!hasValidPhone) {
              console.warn(`⚠️ Customer ${customerData.name} has no valid phone number`);
              return null;
            }

            console.log(`📱 Customer ${customerData.name} - Current Phone: ${customerData.whatsapp_number || customerData.phone} (Profile Updated: ${customerData.updated_at})`);

            // Retornar la notificación con datos FRESCOS del cliente
            return {
              ...notification,
              customers: customerData
            };
          })
        );

        // Filtrar notificaciones nulas y retornar solo las válidas
        const validNotifications = enrichedNotifications.filter(Boolean) as PendingNotification[];

        console.log(`✅ Processed ${validNotifications.length} valid notifications with synchronized customer phone numbers`);
        
        return validNotifications;
      } catch (error) {
        console.error('❌ Error in useArrivalNotifications:', error);
        return [];
      }
    },
    refetchInterval: 10000, // Refrescar cada 10 segundos para datos más actuales
    staleTime: 3000, // Considerar datos obsoletos después de 3 segundos
  });

  // Mutación para preparar notificaciones
  const prepareMutation = useMutation({
    mutationFn: async () => {
      console.log('📋 Preparing arrival notifications with current customer phone numbers...');
      
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
      console.log('✅ Notifications prepared successfully with current phone numbers:', data);
      toast({
        title: "Notificaciones Preparadas",
        description: `${data.prepared} notificaciones preparadas con números actualizados`,
      });
      // Invalidar múltiples queries para asegurar datos actualizados
      queryClient.invalidateQueries({ queryKey: ['arrival-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notification-log'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
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
      console.log('🚀 Executing prepared notifications with synchronized phone numbers...');
      
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
      console.log('✅ Notifications executed successfully with current phone numbers:', data);
      toast({
        title: "Notificaciones Enviadas",
        description: `${data.executed} notificaciones enviadas con números actualizados`,
      });
      // Invalidar todas las queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['arrival-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notification-log'] });
      queryClient.invalidateQueries({ queryKey: ['sent-messages'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
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

  // Nueva mutación para limpiar notificaciones preparadas
  const clearPreparedMutation = useMutation({
    mutationFn: async () => {
      console.log('🗑️ Clearing prepared arrival notifications...');
      
      const { data, error } = await supabase
        .from('notification_log')
        .delete()
        .eq('notification_type', 'package_arrival')
        .eq('status', 'prepared');

      if (error) {
        console.error('❌ Error clearing prepared notifications:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      console.log('✅ Prepared notifications cleared successfully');
      toast({
        title: "Notificaciones Limpiadas",
        description: "Las notificaciones preparadas han sido eliminadas exitosamente",
      });
      // Invalidar queries para refrescar los datos
      queryClient.invalidateQueries({ queryKey: ['arrival-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notification-log'] });
    },
    onError: (error: any) => {
      console.error('❌ Error clearing prepared notifications:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudieron limpiar las notificaciones preparadas",
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
    clearPreparedNotifications: clearPreparedMutation.mutate,
    isPreparing: prepareMutation.isPending,
    isExecuting: executeMutation.isPending,
    isClearing: clearPreparedMutation.isPending
  };
}
