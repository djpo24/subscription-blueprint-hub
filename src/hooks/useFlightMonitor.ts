
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useFlightMonitor() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const startMonitoringMutation = useMutation({
    mutationFn: async () => {
      console.log('=== INICIANDO MONITOREO INTELIGENTE MANUAL ===');
      
      const response = await supabase.functions.invoke('flight-monitor');
      
      console.log('Respuesta del edge function de monitoreo inteligente:', response);
      
      if (response.error) {
        console.error('Error en edge function:', response.error);
        throw response.error;
      }
      
      return response.data;
    },
    onSuccess: (data) => {
      console.log('Monitoreo inteligente completado exitosamente:', data);
      
      queryClient.invalidateQueries({ queryKey: ['pending-flight-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['packages'] });
      
      const apiUsageInfo = data.dailyApiUsage !== undefined 
        ? ` Uso de API hoy: ${data.dailyApiUsage}/${data.maxDailyQueries}.`
        : '';
      
      const message = data.totalFlightsInDb === 0 
        ? "No hay vuelos en la base de datos para monitorear. Crea un viaje con número de vuelo primero."
        : `Monitoreo inteligente completado: ${data.monitored} vuelos analizados, ${data.updated} actualizados.${apiUsageInfo}`;
      
      toast({
        title: "Monitoreo Inteligente Completado",
        description: message,
        variant: data.totalFlightsInDb === 0 ? "destructive" : "default"
      });
    },
    onError: (error: any) => {
      console.error('Error en monitoreo inteligente:', error);
      toast({
        title: "Error en Monitoreo Inteligente",
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
