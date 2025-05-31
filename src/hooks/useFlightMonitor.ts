
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useFlightMonitor() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const startMonitoringMutation = useMutation({
    mutationFn: async () => {
      console.log('Iniciando monitoreo de vuelos...');
      
      const response = await supabase.functions.invoke('flight-monitor');
      
      if (response.error) throw response.error;
      
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['pending-flight-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['packages'] });
      
      toast({
        title: "Monitoreo completado",
        description: `Se monitorearon ${data.monitored} vuelos. ${data.updated} vuelos actualizados.`,
      });
    },
    onError: (error: any) => {
      console.error('Error en monitoreo:', error);
      toast({
        title: "Error en monitoreo",
        description: "No se pudo completar el monitoreo de vuelos",
        variant: "destructive"
      });
    }
  });

  // Función para crear datos de vuelo automáticamente cuando se crea un viaje
  const createFlightDataMutation = useMutation({
    mutationFn: async ({ flightNumber, origin, destination, scheduledDeparture }: {
      flightNumber: string;
      origin: string;
      destination: string;
      scheduledDeparture: string;
    }) => {
      // Calcular hora estimada de llegada (agregar tiempo de vuelo estimado)
      const departureTime = new Date(scheduledDeparture);
      const estimatedFlightDuration = 2 * 60 * 60 * 1000; // 2 horas por defecto
      const scheduledArrival = new Date(departureTime.getTime() + estimatedFlightDuration);

      const { error } = await supabase
        .from('flight_data')
        .insert({
          flight_number: flightNumber,
          departure_airport: origin,
          arrival_airport: destination,
          scheduled_departure: scheduledDeparture,
          scheduled_arrival: scheduledArrival.toISOString(),
          status: 'scheduled',
          has_landed: false,
          notification_sent: false
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-flight-notifications'] });
      toast({
        title: "Datos de vuelo creados",
        description: "Se crearon los datos de monitoreo para el vuelo",
      });
    }
  });

  return {
    startMonitoring: startMonitoringMutation.mutate,
    createFlightData: createFlightDataMutation.mutate,
    isMonitoring: startMonitoringMutation.isPending,
    isCreatingFlightData: createFlightDataMutation.isPending,
  };
}
