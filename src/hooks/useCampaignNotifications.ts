
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CampaignNotification {
  id: string;
  customer_name: string;
  customer_phone: string;
  message_content: string;
  status: 'pending' | 'prepared' | 'sent' | 'failed';
  created_at: string;
  sent_at?: string;
  error_message?: string;
}

interface CampaignNotificationsResult {
  data: CampaignNotification[];
  pendingNotifications: CampaignNotification[];
  preparedNotifications: CampaignNotification[];
  isLoading: boolean;
  prepareNotifications: () => void;
  executeNotifications: () => void;
  clearPreparedNotifications: () => void;
  clearPendingNotifications: () => void;
  isPreparing: boolean;
  isExecuting: boolean;
  isClearing: boolean;
  isClearingPending: boolean;
}

export function useCampaignNotifications(): CampaignNotificationsResult {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Obtener notificaciones de campaña
  const query = useQuery({
    queryKey: ['campaign-notifications'],
    queryFn: async (): Promise<CampaignNotification[]> => {
      console.log('🔍 Obteniendo notificaciones de campaña...');
      
      try {
        const { data: notifications, error: notificationsError } = await supabase
          .from('trip_notification_log')
          .select('*')
          .eq('template_name', 'proximos_viajes')
          .in('status', ['pending', 'prepared'])
          .order('created_at', { ascending: false });

        if (notificationsError) {
          console.error('❌ Error obteniendo notificaciones de campaña:', notificationsError);
          throw notificationsError;
        }

        if (!notifications || notifications.length === 0) {
          console.log('ℹ️ No hay notificaciones de campaña');
          return [];
        }

        const campaignNotifications: CampaignNotification[] = notifications.map(notification => ({
          id: notification.id,
          customer_name: notification.customer_name,
          customer_phone: notification.customer_phone,
          message_content: notification.personalized_message,
          status: notification.status as 'pending' | 'prepared' | 'sent' | 'failed',
          created_at: notification.created_at,
          sent_at: notification.sent_at,
          error_message: notification.error_message
        }));

        console.log(`✅ Encontradas ${campaignNotifications.length} notificaciones de campaña`);
        return campaignNotifications;

      } catch (error) {
        console.error('❌ Error en consulta de notificaciones de campaña:', error);
        return [];
      }
    },
    refetchInterval: 5000,
    staleTime: 1000,
  });

  // Mutación para preparar notificaciones
  const prepareMutation = useMutation({
    mutationFn: async () => {
      console.log('📋 PREPARANDO notificaciones de campaña...');
      
      const { data, error } = await supabase.functions.invoke('process-trip-notification-details', {
        body: { 
          mode: 'prepare',
          template_name: 'proximos_viajes'
        }
      });

      if (error) {
        console.error('❌ Error preparando notificaciones de campaña:', error);
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      console.log('✅ Notificaciones de campaña preparadas exitosamente:', data);
      toast({
        title: "Notificaciones Preparadas",
        description: `${data.prepared} notificaciones de campaña preparadas con fechas de próximos viajes`,
      });
      queryClient.invalidateQueries({ queryKey: ['campaign-notifications'] });
    },
    onError: (error: any) => {
      console.error('❌ Error preparando notificaciones de campaña:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudieron preparar las notificaciones de campaña",
        variant: "destructive"
      });
    }
  });

  // Mutación para ejecutar notificaciones preparadas
  const executeMutation = useMutation({
    mutationFn: async () => {
      console.log('🚀 EJECUTANDO notificaciones de campaña...');
      
      const { data, error } = await supabase.functions.invoke('send-trip-notifications', {
        body: { 
          template_name: 'proximos_viajes'
        }
      });

      if (error) {
        console.error('❌ Error ejecutando notificaciones de campaña:', error);
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      console.log('✅ Notificaciones de campaña ejecutadas exitosamente:', data);
      toast({
        title: "Notificaciones Enviadas",
        description: `${data.executed} notificaciones de campaña enviadas exitosamente`,
      });
      queryClient.invalidateQueries({ queryKey: ['campaign-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['sent-messages'] });
    },
    onError: (error: any) => {
      console.error('❌ Error ejecutando notificaciones de campaña:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudieron enviar las notificaciones de campaña",
        variant: "destructive"
      });
    }
  });

  // Mutación para limpiar notificaciones preparadas
  const clearPreparedMutation = useMutation({
    mutationFn: async () => {
      console.log('🗑️ Limpiando notificaciones de campaña preparadas...');
      
      const { data, error } = await supabase
        .from('trip_notification_log')
        .delete()
        .eq('template_name', 'proximos_viajes')
        .eq('status', 'prepared');

      if (error) {
        console.error('❌ Error limpiando notificaciones de campaña preparadas:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      console.log('✅ Notificaciones de campaña preparadas limpiadas exitosamente');
      toast({
        title: "Notificaciones Limpiadas",
        description: "Las notificaciones de campaña preparadas han sido eliminadas exitosamente",
      });
      queryClient.invalidateQueries({ queryKey: ['campaign-notifications'] });
    },
    onError: (error: any) => {
      console.error('❌ Error limpiando notificaciones de campaña preparadas:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudieron limpiar las notificaciones de campaña preparadas",
        variant: "destructive"
      });
    }
  });

  // Mutación para limpiar notificaciones pendientes
  const clearPendingMutation = useMutation({
    mutationFn: async () => {
      console.log('🗑️ Limpiando notificaciones de campaña pendientes...');
      
      const { data, error } = await supabase
        .from('trip_notification_log')
        .delete()
        .eq('template_name', 'proximos_viajes')
        .eq('status', 'pending');

      if (error) {
        console.error('❌ Error limpiando notificaciones de campaña pendientes:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      console.log('✅ Notificaciones de campaña pendientes limpiadas exitosamente');
      toast({
        title: "Notificaciones Limpiadas",
        description: "Las notificaciones de campaña pendientes han sido eliminadas exitosamente",
      });
      queryClient.invalidateQueries({ queryKey: ['campaign-notifications'] });
    },
    onError: (error: any) => {
      console.error('❌ Error limpiando notificaciones de campaña pendientes:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudieron limpiar las notificaciones de campaña pendientes",
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
    clearPendingNotifications: clearPendingMutation.mutate,
    isPreparing: prepareMutation.isPending,
    isExecuting: executeMutation.isPending,
    isClearing: clearPreparedMutation.isPending,
    isClearingPending: clearPendingMutation.isPending
  };
}
