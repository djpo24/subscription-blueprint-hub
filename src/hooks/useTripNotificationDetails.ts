
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface TripNotificationDetail {
  id: string;
  trip_notification_id: string;
  customer_id: string;
  customer_phone: string;
  customer_name: string;
  personalized_message: string;
  status: 'pending' | 'prepared' | 'sent' | 'failed';
  created_at: string;
}

interface TripNotificationDetailsResult {
  data: TripNotificationDetail[];
  pendingNotifications: TripNotificationDetail[];
  preparedNotifications: TripNotificationDetail[];
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

export function useTripNotificationDetails(tripNotificationId: string, enabled: boolean = true): TripNotificationDetailsResult {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Obtener logs de notificación de viaje con datos del cliente SIEMPRE FRESCOS
  const query = useQuery({
    queryKey: ['trip-notification-details', tripNotificationId],
    queryFn: async (): Promise<TripNotificationDetail[]> => {
      console.log('🔍 Obteniendo detalles de notificación de viaje:', tripNotificationId);
      
      try {
        // 1. Obtener logs de notificación básicos
        const { data: logs, error: logsError } = await supabase
          .from('trip_notification_log')
          .select('*')
          .eq('trip_notification_id', tripNotificationId)
          .in('status', ['pending', 'prepared'])
          .order('created_at', { ascending: false });

        if (logsError) {
          console.error('❌ Error obteniendo logs de notificación:', logsError);
          throw logsError;
        }

        if (!logs || logs.length === 0) {
          console.log('ℹ️ No hay logs de notificación de viaje');
          return [];
        }

        // 2. Para CADA log, hacer consulta DIRECTA Y FRESCA al perfil del cliente
        const logsWithFreshCustomerData = await Promise.all(
          logs.map(async (log) => {
            // CONSULTA DIRECTA Y FRESCA del perfil del cliente
            console.log(`📱 Consultando perfil DIRECTO del cliente ${log.customer_id}...`);
            
            const { data: freshCustomerProfile, error: customerError } = await supabase
              .from('customers')
              .select('id, name, phone, whatsapp_number, updated_at')
              .eq('id', log.customer_id)
              .single();

            if (customerError) {
              console.error(`❌ Error obteniendo perfil FRESCO del cliente ${log.customer_id}:`, customerError);
              return null;
            }

            if (!freshCustomerProfile) {
              console.warn(`⚠️ No se encontró perfil para cliente ${log.customer_id}`);
              return null;
            }

            // Determinar el número de teléfono ACTUAL del perfil
            const currentPhoneNumber = freshCustomerProfile.whatsapp_number || freshCustomerProfile.phone;
            
            if (!currentPhoneNumber || currentPhoneNumber.trim() === '') {
              console.warn(`⚠️ Cliente ${freshCustomerProfile.name} (${log.customer_id}) NO tiene número de teléfono válido en su perfil`);
              return null;
            }

            console.log(`✅ PERFIL FRESCO obtenido para ${freshCustomerProfile.name}:`);
            console.log(`📱 Número actual en perfil: "${currentPhoneNumber}"`);

            // Construir log con datos FRESCOS del perfil
            return {
              ...log,
              customer_phone: currentPhoneNumber,
              customer_name: freshCustomerProfile.name
            };
          })
        );

        // Filtrar logs válidos
        const validLogs = logsWithFreshCustomerData.filter(Boolean) as TripNotificationDetail[];

        console.log(`🎯 RESULTADO FINAL: ${validLogs.length} logs con números de teléfono DIRECTOS del perfil`);
        
        return validLogs;

      } catch (error) {
        console.error('❌ Error en consulta de logs con perfiles frescos:', error);
        return [];
      }
    },
    enabled: enabled && !!tripNotificationId,
    refetchInterval: 5000,
    staleTime: 1000,
  });

  // Mutación para preparar notificaciones (crear logs y generar mensajes)
  const prepareMutation = useMutation({
    mutationFn: async () => {
      console.log('📋 PREPARANDO notificaciones de viaje para:', tripNotificationId);
      
      const { data, error } = await supabase.functions.invoke('process-trip-notification-details', {
        body: { 
          tripNotificationId,
          mode: 'prepare' 
        }
      });

      if (error) {
        console.error('❌ Error preparando notificaciones de viaje:', error);
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      console.log('✅ Notificaciones de viaje preparadas exitosamente:', data);
      toast({
        title: "Notificaciones Preparadas",
        description: `${data.prepared} notificaciones de viaje preparadas con números DIRECTOS del perfil del cliente`,
      });
      queryClient.invalidateQueries({ queryKey: ['trip-notification-details', tripNotificationId] });
    },
    onError: (error: any) => {
      console.error('❌ Error preparando notificaciones de viaje:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudieron preparar las notificaciones de viaje",
        variant: "destructive"
      });
    }
  });

  // Mutación para ejecutar notificaciones preparadas
  const executeMutation = useMutation({
    mutationFn: async () => {
      console.log('🚀 EJECUTANDO notificaciones de viaje preparadas para:', tripNotificationId);
      
      const { data, error } = await supabase.functions.invoke('process-trip-notification-details', {
        body: { 
          tripNotificationId,
          mode: 'execute' 
        }
      });

      if (error) {
        console.error('❌ Error ejecutando notificaciones de viaje:', error);
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      console.log('✅ Notificaciones de viaje ejecutadas exitosamente:', data);
      toast({
        title: "Notificaciones Enviadas",
        description: `${data.executed} notificaciones de viaje enviadas con números DIRECTOS del perfil del cliente`,
      });
      queryClient.invalidateQueries({ queryKey: ['trip-notification-details', tripNotificationId] });
      queryClient.invalidateQueries({ queryKey: ['trip-notifications'] });
    },
    onError: (error: any) => {
      console.error('❌ Error ejecutando notificaciones de viaje:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudieron enviar las notificaciones de viaje",
        variant: "destructive"
      });
    }
  });

  // Mutación para limpiar notificaciones preparadas
  const clearPreparedMutation = useMutation({
    mutationFn: async () => {
      console.log('🗑️ Limpiando notificaciones de viaje preparadas...');
      
      const { data, error } = await supabase
        .from('trip_notification_log')
        .delete()
        .eq('trip_notification_id', tripNotificationId)
        .eq('status', 'prepared');

      if (error) {
        console.error('❌ Error limpiando notificaciones de viaje preparadas:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      console.log('✅ Notificaciones de viaje preparadas limpiadas exitosamente');
      toast({
        title: "Notificaciones Limpiadas",
        description: "Las notificaciones de viaje preparadas han sido eliminadas exitosamente",
      });
      queryClient.invalidateQueries({ queryKey: ['trip-notification-details', tripNotificationId] });
    },
    onError: (error: any) => {
      console.error('❌ Error limpiando notificaciones de viaje preparadas:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudieron limpiar las notificaciones de viaje preparadas",
        variant: "destructive"
      });
    }
  });

  // Mutación para limpiar notificaciones pendientes
  const clearPendingMutation = useMutation({
    mutationFn: async () => {
      console.log('🗑️ Limpiando notificaciones de viaje pendientes...');
      
      const { data, error } = await supabase
        .from('trip_notification_log')
        .delete()
        .eq('trip_notification_id', tripNotificationId)
        .eq('status', 'pending');

      if (error) {
        console.error('❌ Error limpiando notificaciones de viaje pendientes:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      console.log('✅ Notificaciones de viaje pendientes limpiadas exitosamente');
      toast({
        title: "Notificaciones Limpiadas",
        description: "Las notificaciones de viaje pendientes han sido eliminadas exitosamente",
      });
      queryClient.invalidateQueries({ queryKey: ['trip-notification-details', tripNotificationId] });
    },
    onError: (error: any) => {
      console.error('❌ Error limpiando notificaciones de viaje pendientes:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudieron limpiar las notificaciones de viaje pendientes",
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
