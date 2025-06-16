
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useChangePackageStatus() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const changeStatusMutation = useMutation({
    mutationFn: async ({ packageId, newStatus }: { packageId: string; newStatus: string }) => {
      console.log('🔄 [useChangePackageStatus] Cambiando estado del paquete:', {
        packageId,
        newStatus
      });

      // Actualizar el estado del paquete
      const { error } = await supabase
        .from('packages')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', packageId);

      if (error) {
        console.error('❌ Error actualizando estado:', error);
        throw error;
      }

      // Crear evento de tracking para registrar el cambio manual
      await supabase
        .from('tracking_events')
        .insert([{
          package_id: packageId,
          event_type: 'status_change',
          description: `Estado cambiado manualmente a "${newStatus}"`,
          location: 'Sistema'
        }]);

      console.log('✅ Estado del paquete actualizado exitosamente');
      return { packageId, newStatus };
    },
    onSuccess: (data) => {
      // Invalidar todas las queries relevantes
      queryClient.invalidateQueries({ queryKey: ['packages'] });
      queryClient.invalidateQueries({ queryKey: ['packages-by-date'] });
      queryClient.invalidateQueries({ queryKey: ['packages-by-trip'] });
      queryClient.invalidateQueries({ queryKey: ['dispatch-relations'] });
      queryClient.invalidateQueries({ queryKey: ['dispatch-packages'] });
      
      // Refetch inmediato
      queryClient.refetchQueries({ queryKey: ['packages'] });
      
      toast({
        title: "Estado actualizado",
        description: `El paquete ahora está en estado: ${data.newStatus}`,
      });
    },
    onError: (error: any) => {
      console.error('❌ Error cambiando estado:', error);
      toast({
        title: "Error",
        description: "No se pudo cambiar el estado del paquete",
        variant: "destructive"
      });
    }
  });

  return {
    changeStatus: changeStatusMutation.mutate,
    isChanging: changeStatusMutation.isPending,
  };
}
