
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useDeleteTrip() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (tripId: string) => {
      console.log('🗑️ Eliminando viaje:', tripId);

      // Primero verificar si el viaje tiene encomiendas
      const { data: packages, error: packagesError } = await supabase
        .from('packages')
        .select('id')
        .eq('trip_id', tripId);

      if (packagesError) {
        console.error('❌ Error verificando encomiendas:', packagesError);
        throw new Error('Error verificando encomiendas del viaje');
      }

      if (packages && packages.length > 0) {
        throw new Error(`No se puede eliminar el viaje porque tiene ${packages.length} encomienda${packages.length > 1 ? 's' : ''} asociada${packages.length > 1 ? 's' : ''}`);
      }

      // Si no hay encomiendas, proceder a eliminar el viaje
      const { error } = await supabase
        .from('trips')
        .delete()
        .eq('id', tripId);

      if (error) {
        console.error('❌ Error eliminando viaje:', error);
        throw error;
      }

      console.log('✅ Viaje eliminado exitosamente');
      return tripId;
    },
    onSuccess: (tripId) => {
      toast({
        title: "Viaje eliminado",
        description: "El viaje ha sido eliminado exitosamente.",
      });

      // Invalidar consultas relacionadas
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      queryClient.invalidateQueries({ queryKey: ['packages'] });
      queryClient.invalidateQueries({ queryKey: ['packages-by-date'] });
    },
    onError: (error: Error) => {
      console.error('❌ Error en useDeleteTrip:', error);
      
      toast({
        title: "Error al eliminar viaje",
        description: error.message || "Hubo un problema al eliminar el viaje.",
        variant: "destructive",
      });
    },
  });
}
