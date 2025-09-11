
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useFlightInfoUpdate() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const updateFlightInfoMutation = useMutation({
    mutationFn: async (flightNumber: string) => {
      console.log('Actualizando información del vuelo:', flightNumber);
      
      const response = await supabase.functions.invoke('update-flight-info', {
        body: { flight_number: flightNumber }
      });
      
      console.log('Respuesta del edge function:', response);
      
      if (response.error) {
        console.error('Error en edge function:', response.error);
        throw response.error;
      }
      
      return response.data;
    },
    onSuccess: (data) => {
      console.log('Información del vuelo actualizada exitosamente:', data);
      
      // Invalidar queries relacionadas para refrescar los datos
      queryClient.invalidateQueries({ queryKey: ['pending-flight-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['upcoming-flights'] });
      queryClient.invalidateQueries({ queryKey: ['trips-with-flights'] });
      
      toast({
        title: "Información actualizada",
        description: "La información del vuelo se ha actualizado con datos de la API",
      });
    },
    onError: (error: any) => {
      console.error('Error actualizando información del vuelo:', error);
      toast({
        title: "Error",
        description: `No se pudo actualizar la información del vuelo: ${error.message || 'Error desconocido'}`,
        variant: "destructive"
      });
    }
  });

  return {
    updateFlightInfo: updateFlightInfoMutation.mutate,
    isUpdating: updateFlightInfoMutation.isPending,
  };
}
