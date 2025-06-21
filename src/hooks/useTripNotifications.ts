
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

export function useTripNotifications() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['trip-notifications'],
    queryFn: async (): Promise<TripNotification[]> => {
      console.log('Fetching trip notifications...');
      
      const { data, error } = await supabase
        .from('trip_notifications')
        .select(`
          *,
          outbound_trip:outbound_trip_id(trip_date, origin, destination, flight_number),
          return_trip:return_trip_id(trip_date, origin, destination, flight_number)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching trip notifications:', error);
        throw error;
      }

      // Type assertion to ensure the data matches our interface
      return (data || []).map(item => ({
        ...item,
        status: item.status as 'draft' | 'sent'
      })) as TripNotification[];
    }
  });

  const createNotificationMutation = useMutation({
    mutationFn: async (notification: Omit<TripNotification, 'id' | 'created_at' | 'updated_at' | 'sent_at' | 'total_customers_sent' | 'success_count' | 'failed_count' | 'status'>) => {
      console.log('Creating trip notification:', notification);
      
      const { data, error } = await supabase
        .from('trip_notifications')
        .insert(notification)
        .select()
        .single();

      if (error) {
        console.error('Error creating trip notification:', error);
        throw error;
      }

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
      console.error('Error creating trip notification:', error);
      toast({
        title: "Error",
        description: "No se pudo crear la notificación",
        variant: "destructive"
      });
    }
  });

  const sendNotificationMutation = useMutation({
    mutationFn: async (tripNotificationId: string) => {
      console.log('Sending trip notification:', tripNotificationId);
      
      const { data, error } = await supabase.functions.invoke('send-trip-notifications', {
        body: { tripNotificationId }
      });

      if (error) {
        console.error('Error sending trip notification:', error);
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      toast({
        title: "Notificaciones enviadas",
        description: `Se enviaron ${data.successCount} notificaciones exitosamente. ${data.failedCount} fallaron.`,
      });
      queryClient.invalidateQueries({ queryKey: ['trip-notifications'] });
    },
    onError: (error: any) => {
      console.error('Error sending trip notification:', error);
      toast({
        title: "Error",
        description: "No se pudieron enviar las notificaciones",
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
