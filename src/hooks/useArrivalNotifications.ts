
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

  // Obtener notificaciones con datos del cliente SIEMPRE FRESCOS desde la tabla customers
  const query = useQuery({
    queryKey: ['arrival-notifications'],
    queryFn: async (): Promise<PendingNotification[]> => {
      console.log('🔍 NUEVA IMPLEMENTACIÓN: Obteniendo notificaciones con números de teléfono DIRECTOS del perfil...');
      
      try {
        // 1. Obtener notificaciones básicas SIN datos de clientes
        const { data: notifications, error: notificationsError } = await supabase
          .from('notification_log')
          .select(`
            id,
            customer_id,
            package_id,
            notification_type,
            message,
            status,
            created_at,
            packages!notification_log_package_id_fkey (
              tracking_number,
              destination,
              amount_to_collect,
              currency,
              customer_id
            )
          `)
          .eq('notification_type', 'package_arrival')
          .in('status', ['pending', 'prepared'])
          .order('created_at', { ascending: false });

        if (notificationsError) {
          console.error('❌ Error obteniendo notificaciones:', notificationsError);
          throw notificationsError;
        }

        if (!notifications || notifications.length === 0) {
          console.log('ℹ️ No hay notificaciones de llegada');
          return [];
        }

        // 2. Para CADA notificación, hacer consulta DIRECTA Y FRESCA al perfil del cliente
        const notificationsWithFreshCustomerData = await Promise.all(
          notifications.map(async (notification) => {
            // Determinar customer_id (puede venir de la notificación o del paquete)
            const customerId = notification.customer_id || notification.packages?.customer_id;
            
            if (!customerId) {
              console.warn(`⚠️ Notificación ${notification.id} sin customer_id válido`);
              return null;
            }

            // CONSULTA DIRECTA Y FRESCA del perfil del cliente - IGNORAMOS cualquier dato previo
            console.log(`📱 Consultando perfil DIRECTO del cliente ${customerId}...`);
            
            const { data: freshCustomerProfile, error: customerError } = await supabase
              .from('customers')
              .select('id, name, phone, whatsapp_number, updated_at')
              .eq('id', customerId)
              .single();

            if (customerError) {
              console.error(`❌ Error obteniendo perfil FRESCO del cliente ${customerId}:`, customerError);
              return null;
            }

            if (!freshCustomerProfile) {
              console.warn(`⚠️ No se encontró perfil para cliente ${customerId}`);
              return null;
            }

            // Determinar el número de teléfono ACTUAL del perfil
            const currentPhoneNumber = freshCustomerProfile.whatsapp_number || freshCustomerProfile.phone;
            
            if (!currentPhoneNumber || currentPhoneNumber.trim() === '') {
              console.warn(`⚠️ Cliente ${freshCustomerProfile.name} (${customerId}) NO tiene número de teléfono válido en su perfil`);
              return null;
            }

            console.log(`✅ PERFIL FRESCO obtenido para ${freshCustomerProfile.name}:`);
            console.log(`📱 Número actual en perfil: "${currentPhoneNumber}"`);
            console.log(`🕒 Perfil actualizado: ${freshCustomerProfile.updated_at}`);

            // Construir notificación con datos FRESCOS del perfil
            return {
              ...notification,
              customer_id: customerId,
              customers: {
                id: freshCustomerProfile.id,
                name: freshCustomerProfile.name,
                phone: freshCustomerProfile.phone,
                whatsapp_number: freshCustomerProfile.whatsapp_number,
                updated_at: freshCustomerProfile.updated_at
              }
            };
          })
        );

        // Filtrar notificaciones válidas
        const validNotifications = notificationsWithFreshCustomerData.filter(Boolean) as PendingNotification[];

        console.log(`🎯 RESULTADO FINAL: ${validNotifications.length} notificaciones con números de teléfono DIRECTOS del perfil`);
        
        // Log de todos los números obtenidos para verificación
        validNotifications.forEach(notif => {
          const phone = notif.customers?.whatsapp_number || notif.customers?.phone;
          console.log(`📋 Notificación ${notif.id} - Cliente: ${notif.customers?.name} - Teléfono DIRECTO: "${phone}"`);
        });
        
        return validNotifications;

      } catch (error) {
        console.error('❌ Error en consulta de notificaciones con perfiles frescos:', error);
        return [];
      }
    },
    refetchInterval: 5000, // Refrescar cada 5 segundos para datos más actuales
    staleTime: 1000, // Considerar datos obsoletos después de 1 segundo
  });

  // Mutación para preparar notificaciones
  const prepareMutation = useMutation({
    mutationFn: async () => {
      console.log('📋 PREPARANDO notificaciones con números de teléfono DIRECTOS del perfil...');
      
      const { data, error } = await supabase.functions.invoke('process-arrival-notifications', {
        body: { mode: 'prepare' }
      });

      if (error) {
        console.error('❌ Error preparando notificaciones:', error);
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      console.log('✅ Notificaciones preparadas exitosamente con números DIRECTOS del perfil:', data);
      toast({
        title: "Notificaciones Preparadas",
        description: `${data.prepared} notificaciones preparadas con números DIRECTOS del perfil del cliente`,
      });
      // Invalidar todas las queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['arrival-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notification-log'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
    onError: (error: any) => {
      console.error('❌ Error preparando notificaciones:', error);
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
      console.log('🚀 EJECUTANDO notificaciones con números de teléfono DIRECTOS del perfil...');
      
      const { data, error } = await supabase.functions.invoke('process-arrival-notifications', {
        body: { mode: 'execute' }
      });

      if (error) {
        console.error('❌ Error ejecutando notificaciones:', error);
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      console.log('✅ Notificaciones ejecutadas exitosamente con números DIRECTOS del perfil:', data);
      toast({
        title: "Notificaciones Enviadas",
        description: `${data.executed} notificaciones enviadas con números DIRECTOS del perfil del cliente`,
      });
      // Invalidar todas las queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['arrival-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notification-log'] });
      queryClient.invalidateQueries({ queryKey: ['sent-messages'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
    onError: (error: any) => {
      console.error('❌ Error ejecutando notificaciones:', error);
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
      console.log('🗑️ Limpiando notificaciones preparadas...');
      
      const { data, error } = await supabase
        .from('notification_log')
        .delete()
        .eq('notification_type', 'package_arrival')
        .eq('status', 'prepared');

      if (error) {
        console.error('❌ Error limpiando notificaciones preparadas:', error);
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      console.log('✅ Notificaciones preparadas limpiadas exitosamente');
      toast({
        title: "Notificaciones Limpiadas",
        description: "Las notificaciones preparadas han sido eliminadas exitosamente",
      });
      // Invalidar queries para refrescar los datos
      queryClient.invalidateQueries({ queryKey: ['arrival-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notification-log'] });
    },
    onError: (error: any) => {
      console.error('❌ Error limpiando notificaciones preparadas:', error);
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
