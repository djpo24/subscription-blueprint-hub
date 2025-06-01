
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useFlightMonitor() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const startMonitoringMutation = useMutation({
    mutationFn: async () => {
      console.log('=== INICIANDO MONITOREO MANUAL ===');
      
      const response = await supabase.functions.invoke('flight-monitor');
      
      console.log('Respuesta del edge function:', response);
      
      if (response.error) {
        console.error('Error en edge function:', response.error);
        throw response.error;
      }
      
      return response.data;
    },
    onSuccess: (data) => {
      console.log('Monitoreo completado exitosamente:', data);
      
      queryClient.invalidateQueries({ queryKey: ['pending-flight-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['packages'] });
      
      const message = data.totalFlightsInDb === 0 
        ? "No hay vuelos en la base de datos para monitorear. Crea un viaje con número de vuelo primero."
        : `Se monitorearon ${data.monitored} vuelos. ${data.updated} vuelos actualizados. Total en DB: ${data.totalFlightsInDb}`;
      
      toast({
        title: "Monitoreo completado",
        description: message,
        variant: data.totalFlightsInDb === 0 ? "destructive" : "default"
      });
    },
    onError: (error: any) => {
      console.error('Error en monitoreo:', error);
      toast({
        title: "Error en monitoreo",
        description: `No se pudo completar el monitoreo: ${error.message || 'Error desconocido'}`,
        variant: "destructive"
      });
    }
  });

  return {
    startMonitoring: startMonitoringMutation.mutate,
    isMonitoring: startMonitoringMutation.isPending,
  };
}
