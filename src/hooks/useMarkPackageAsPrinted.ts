
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

      // Actualizar estados según la lógica: una vez impreso, nunca vuelve a pendiente
      const updates = packages?.map(pkg => {
        let newStatus = pkg.status;
        
        // Si está en recibido (pendiente), pasa a procesado (impreso)
        if (pkg.status === 'recibido') {
          newStatus = 'procesado';
          console.log(`📦 Paquete ${pkg.id}: ${pkg.status} → ${newStatus} (primera impresión)`);
        }
        // Si ya está impreso (cualquier estado != recibido), mantiene su estado actual
        // Esto asegura que nunca vuelva a "recibido" (pendiente)
        else {
          console.log(`📦 Paquete ${pkg.id}: mantiene estado ${pkg.status} (re-impresión)`);
        }
        
        return {
          id: pkg.id,
          oldStatus: pkg.status,
          newStatus
        };
      }) || [];

      // Ejecutar las actualizaciones solo si hay cambios de estado
      const packagesToUpdate = updates.filter(update => update.oldStatus !== update.newStatus);
      
      for (const update of packagesToUpdate) {
        const { error } = await supabase
          .from('packages')
          .update({ status: update.newStatus })
          .eq('id', update.id);

        if (error) {
          console.error(`❌ Error updating package ${update.id}:`, error);
          throw error;
        }
      }

      console.log('✅ Paquetes procesados para impresión:', {
        total: updates.length,
        updated: packagesToUpdate.length,
        maintained: updates.length - packagesToUpdate.length
      });
      
      return updates;
    },
    onSuccess: (updates) => {
      // Invalidar queries relacionadas para refrescar la UI
      queryClient.invalidateQueries({ queryKey: ['packages'] });
      queryClient.invalidateQueries({ queryKey: ['packagesByDate'] });
      queryClient.invalidateQueries({ queryKey: ['packagesByTrip'] });
      
      const updatedCount = updates.filter(u => u.oldStatus !== u.newStatus).length;
      
      if (updatedCount > 0) {
        toast.success(`${updates.length} etiqueta${updates.length !== 1 ? 's' : ''} procesada${updates.length !== 1 ? 's' : ''} para impresión`);
      } else {
        toast.success(`${updates.length} etiqueta${updates.length !== 1 ? 's' : ''} re-impresa${updates.length !== 1 ? 's' : ''}`);
      }
    },
    onError: (error) => {
      console.error('❌ Error procesando etiquetas para impresión:', error);
      toast.error('Error al procesar las etiquetas para impresión');
    }
  });
}
