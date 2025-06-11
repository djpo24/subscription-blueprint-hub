
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useDeleteDispatch() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dispatchId: string) => {
      console.log('🗑️ Deleting dispatch:', dispatchId);

      // Primero eliminar las relaciones dispatch_packages
      const { error: packagesError } = await supabase
        .from('dispatch_packages')
        .delete()
        .eq('dispatch_id', dispatchId);

      if (packagesError) {
        console.error('❌ Error deleting dispatch packages:', packagesError);
        throw new Error('Error al eliminar paquetes del despacho');
      }

      // Luego eliminar el despacho
      const { error: dispatchError } = await supabase
        .from('dispatch_relations')
        .delete()
        .eq('id', dispatchId);

      if (dispatchError) {
        console.error('❌ Error deleting dispatch:', dispatchError);
        throw new Error('Error al eliminar el despacho');
      }

      console.log('✅ Dispatch deleted successfully');
      return dispatchId;
    },
    onSuccess: () => {
      toast({
        title: "Despacho eliminado",
        description: "El despacho ha sido eliminado correctamente",
      });
      queryClient.invalidateQueries({ queryKey: ['dispatch-relations'] });
    },
    onError: (error: any) => {
      console.error('❌ Error deleting dispatch:', error);
      toast({
        title: "Error al eliminar",
        description: error.message,
        variant: "destructive"
      });
    }
  });
}
