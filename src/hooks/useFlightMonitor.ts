
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

  return {
    startMonitoring: startMonitoringMutation.mutate,
    isMonitoring: startMonitoringMutation.isPending,
  };
}
