
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface MarkPackageAsPrintedData {
  packageIds: string[];
}

export function useMarkPackageAsPrinted() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ packageIds }: MarkPackageAsPrintedData) => {
      console.log('🏷️ Marcando paquetes como impresos:', packageIds);

      // Determinar el nuevo estado basado en el estado actual
      const { data: packages, error: fetchError } = await supabase
        .from('packages')
        .select('id, status')
        .in('id', packageIds);

      if (fetchError) {
        console.error('❌ Error fetching packages:', fetchError);
        throw fetchError;
      }

      // Actualizar estados según la lógica actual
      const updates = packages?.map(pkg => {
        let newStatus = pkg.status;
        
        // Si está en recibido, pasa a procesado
        if (pkg.status === 'recibido') {
          newStatus = 'procesado';
        }
        // Si está en procesado, pasa a transito
        else if (pkg.status === 'procesado') {
          newStatus = 'transito';
        }
        // Si ya está en transito o superior, mantiene su estado
        
        return {
          id: pkg.id,
          newStatus
        };
      }) || [];

      // Ejecutar las actualizaciones
      for (const update of updates) {
        const { error } = await supabase
          .from('packages')
          .update({ status: update.newStatus })
          .eq('id', update.id);

        if (error) {
          console.error(`❌ Error updating package ${update.id}:`, error);
          throw error;
        }
      }

      console.log('✅ Paquetes marcados como impresos exitosamente');
      return updates;
    },
    onSuccess: (updates) => {
      // Invalidar queries relacionadas para refrescar la UI
      queryClient.invalidateQueries({ queryKey: ['packages'] });
      queryClient.invalidateQueries({ queryKey: ['packagesByDate'] });
      queryClient.invalidateQueries({ queryKey: ['packagesByTrip'] });
      
      toast.success(`${updates.length} etiqueta${updates.length !== 1 ? 's' : ''} marcada${updates.length !== 1 ? 's' : ''} como impresa${updates.length !== 1 ? 's' : ''}`);
    },
    onError: (error) => {
      console.error('❌ Error marcando paquetes como impresos:', error);
      toast.error('Error al marcar las etiquetas como impresas');
    }
  });
}
