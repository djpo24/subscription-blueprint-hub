
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface FlightData {
  id: string;
  flight_number: string;
  status: string;
  actual_arrival: string | null;
  has_landed: boolean;
  notification_sent: boolean;
  departure_airport: string;
  arrival_airport: string;
}

export function useFlightNotifications() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch flight data that needs processing
  const { data: pendingFlights = [], isLoading } = useQuery({
    queryKey: ['pending-flight-notifications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('flight_data')
        .select('*')
        .eq('has_landed', true)
        .eq('notification_sent', false);
      
      if (error) throw error;
      return data as FlightData[];
    },
    refetchInterval: 30000, // Check every 30 seconds
  });

  // Mutation to process notifications
  const processNotificationsMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc('process_arrival_notifications');
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-flight-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['packages'] });
      queryClient.invalidateQueries({ queryKey: ['notification-log'] });
      toast({
        title: "Notificaciones procesadas",
        description: "Se han enviado las notificaciones de llegada pendientes",
      });
    },
    onError: (error: any) => {
      console.error('Error processing notifications:', error);
      toast({
        title: "Error",
        description: "No se pudieron procesar las notificaciones",
        variant: "destructive"
      });
    }
  });

  // Mutation to manually update flight status
  const updateFlightStatusMutation = useMutation({
    mutationFn: async ({ flightId, hasLanded }: { flightId: string, hasLanded: boolean }) => {
      const { error } = await supabase
        .from('flight_data')
        .update({ 
          has_landed: hasLanded,
          actual_arrival: hasLanded ? new Date().toISOString() : null 
        })
        .eq('id', flightId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-flight-notifications'] });
      toast({
        title: "Estado actualizado",
        description: "El estado del vuelo ha sido actualizado",
      });
    }
  });

  return {
    pendingFlights,
    isLoading,
    processNotifications: processNotificationsMutation.mutate,
    updateFlightStatus: updateFlightStatusMutation.mutate,
    isProcessing: processNotificationsMutation.isPending,
  };
}
