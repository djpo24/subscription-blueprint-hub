
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface TripNotification {
  id: string;
  outbound_trip_id: string;
  return_trip_id: string;
  deadline_date: string;
  deadline_time: string;
  message_template: string;
  template_name: string;
  template_language: string;
  total_customers_sent: number;
  success_count: number;
  failed_count: number;
  status: 'draft' | 'sent';
  created_by: string | null;
  sent_at: string | null;
  created_at: string;
  updated_at: string;
  outbound_trip?: {
    trip_date: string;
    origin: string;
    destination: string;
    flight_number: string | null;
  };
  return_trip?: {
    trip_date: string;
    origin: string;
    destination: string;
    flight_number: string | null;
  };
}

interface CreateTripNotificationInput {
  outbound_trip_id: string;
  return_trip_id: string;
  deadline_date: string;
  deadline_time: string;
  message_template: string;
  template_name: string;
  template_language: string;
  created_by: string | null;
}

export function useTripNotifications() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['trip-notifications'],
    queryFn: async (): Promise<TripNotification[]> => {
      console.log('🔍 Fetching trip notifications...');
      
      const { data: notificationData, error: notificationError } = await supabase
        .from('trip_notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (notificationError) {
        console.error('❌ Error fetching trip notifications:', notificationError);
        throw notificationError;
      }

      if (!notificationData || notificationData.length === 0) {
        console.log('📋 No trip notifications found');
        return [];
      }

      console.log(`📋 Found ${notificationData.length} trip notifications`);

      // Get all unique trip IDs
      const tripIds = new Set<string>();
      notificationData.forEach(notification => {
        tripIds.add(notification.outbound_trip_id);
        tripIds.add(notification.return_trip_id);
      });

      // Fetch all related trips
      const { data: tripsData, error: tripsError } = await supabase
        .from('trips')
        .select('id, trip_date, origin, destination, flight_number')
        .in('id', Array.from(tripIds));

      if (tripsError) {
        console.error('❌ Error fetching trips:', tripsError);
        throw tripsError;
      }

      // Create a map of trips by ID for easy lookup
      const tripsMap = new Map();
      tripsData?.forEach(trip => {
        tripsMap.set(trip.id, trip);
      });

      const result: TripNotification[] = notificationData.map(notification => ({
        ...notification,
        status: notification.status as 'draft' | 'sent',
        template_name: notification.template_name || 'proximos_viajes',
        template_language: notification.template_language || 'es_CO',
        outbound_trip: tripsMap.get(notification.outbound_trip_id) || undefined,
        return_trip: tripsMap.get(notification.return_trip_id) || undefined,
      }));

      console.log(`✅ Processed ${result.length} trip notifications with template info`);
      return result;
    }
  });

  const createNotificationMutation = useMutation({
    mutationFn: async (notification: CreateTripNotificationInput) => {
      console.log('📝 Creating trip notification with data:', notification);
      
      if (!notification.outbound_trip_id || !notification.return_trip_id) {
        throw new Error('Debe seleccionar viajes de ida y retorno');
      }
      
      if (!notification.deadline_date) {
        throw new Error('Debe especificar la fecha límite');
      }
      
      if (!notification.template_name) {
        throw new Error('Debe seleccionar una plantilla de WhatsApp');
      }

      const insertData = {
        outbound_trip_id: notification.outbound_trip_id,
        return_trip_id: notification.return_trip_id,
        deadline_date: notification.deadline_date,
        deadline_time: notification.deadline_time,
        message_template: notification.message_template || '',
        template_name: notification.template_name,
        template_language: notification.template_language || 'es_CO',
        status: 'draft',
        total_customers_sent: 0,
        success_count: 0,
        failed_count: 0
      };

      console.log('📋 Inserting trip notification with template data:', insertData);

      const { data, error } = await supabase
        .from('trip_notifications')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating trip notification:', error);
        throw error;
      }

      console.log('✅ Trip notification created successfully with template:', data.template_name);
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Notificación creada",
        description: "La notificación de viaje ha sido creada exitosamente",
      });
      queryClient.invalidateQueries({ queryKey: ['trip-notifications'] });
    },
    onError: (error: any) => {
      console.error('❌ Error creating trip notification:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo crear la notificación",
        variant: "destructive"
      });
    }
  });

  const sendNotificationMutation = useMutation({
    mutationFn: async (tripNotificationId: string) => {
      console.log('📤 Sending trip notification:', tripNotificationId);
      
      if (!tripNotificationId) {
        throw new Error('ID de notificación requerido');
      }
      
      try {
        const { data, error } = await supabase.functions.invoke('send-trip-notifications', {
          body: { tripNotificationId }
        });

        console.log('📤 Edge function response:', { data, error });

        if (error) {
          console.error('❌ Edge function error:', error);
          // Intentar extraer el mensaje de error más específico
          let errorMessage = 'Error al enviar las notificaciones';
          
          if (error.message) {
            errorMessage = error.message;
          } else if (typeof error === 'string') {
            errorMessage = error;
          }
          
          throw new Error(errorMessage);
        }

        if (!data) {
          throw new Error('No se recibió respuesta de la función de envío');
        }

        if (!data.success) {
          throw new Error(data.error || 'Error desconocido al enviar notificaciones');
        }

        console.log('✅ Trip notification sent successfully:', data);
        return data;
      } catch (functionError) {
        console.error('❌ Complete function error:', functionError);
        
        // Mejorar el manejo de errores para mostrar información más útil
        if (functionError.message && functionError.message.includes('Edge Function returned a non-2xx status code')) {
          throw new Error('Error del servidor: Verifique los logs de la función Edge o contacte al administrador');
        }
        
        throw functionError;
      }
    },
    onSuccess: (data) => {
      const templateInfo = data.templateUsed ? ` usando plantilla ${data.templateUsed}` : '';
      const successMessage = data.successCount > 0 
        ? `Se enviaron ${data.successCount} notificaciones exitosamente${templateInfo}.`
        : 'No se enviaron notificaciones.';
      
      const failureMessage = data.failedCount > 0 
        ? ` ${data.failedCount} fallaron.`
        : '';

      toast({
        title: "✅ Proceso completado",
        description: successMessage + failureMessage,
        variant: data.successCount > 0 ? "default" : "destructive"
      });
      
      queryClient.invalidateQueries({ queryKey: ['trip-notifications'] });
    },
    onError: (error: any) => {
      console.error('❌ Send notification mutation error:', error);
      
      let errorMessage = "No se pudieron enviar las notificaciones";
      
      if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "❌ Error",
        description: errorMessage,
        variant: "destructive"
      });
    }
  });

  return {
    notifications,
    isLoading,
    createNotification: createNotificationMutation.mutateAsync,
    isCreating: createNotificationMutation.isPending,
    sendNotification: sendNotificationMutation.mutateAsync,
    isSending: sendNotificationMutation.isPending,
  };
}
