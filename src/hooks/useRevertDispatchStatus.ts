import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useRevertDispatchStatus() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const revertMutation = useMutation({
    mutationFn: async ({ dispatchId, targetStatus }: { dispatchId: string; targetStatus: 'en_transito' | 'pending' }) => {
      console.log('🔄 [useRevertDispatchStatus] Revirtiendo despacho:', dispatchId, 'a:', targetStatus);

      // Get dispatch packages
      const { data: dispatchPackages, error: packagesError } = await supabase
        .from('dispatch_packages')
        .select('package_id')
        .eq('dispatch_id', dispatchId);

      if (packagesError) throw packagesError;

      const packageIds = dispatchPackages?.map(dp => dp.package_id).filter(Boolean) as string[];

      if (targetStatus === 'en_transito') {
        // Revert from "llegado" to "en_transito": packages go back to "transito"
        if (packageIds.length > 0) {
          const { error } = await supabase
            .from('packages')
            .update({ status: 'transito', updated_at: new Date().toISOString() })
            .in('id', packageIds)
            .in('status', ['en_destino', 'delivered']);

          if (error) throw error;
        }

        // Delete arrival notifications that were created but not yet sent
        await supabase
          .from('notification_log')
          .delete()
          .in('package_id', packageIds)
          .eq('notification_type', 'package_arrival')
          .eq('status', 'pending');

        // Update dispatch status
        const { error: dispatchError } = await supabase
          .from('dispatch_relations')
          .update({ status: 'en_transito', updated_at: new Date().toISOString() })
          .eq('id', dispatchId);

        if (dispatchError) throw dispatchError;
      } else {
        // Revert to pending
        if (packageIds.length > 0) {
          const { error } = await supabase
            .from('packages')
            .update({ status: 'procesado', updated_at: new Date().toISOString() })
            .in('id', packageIds);

          if (error) throw error;
        }

        const { error: dispatchError } = await supabase
          .from('dispatch_relations')
          .update({ status: 'pending', updated_at: new Date().toISOString() })
          .eq('id', dispatchId);

        if (dispatchError) throw dispatchError;
      }

      return { dispatchId, targetStatus };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['dispatch-relations'] });
      queryClient.invalidateQueries({ queryKey: ['dispatch-packages'] });
      queryClient.invalidateQueries({ queryKey: ['packages'] });
      queryClient.invalidateQueries({ queryKey: ['packages-by-date'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notification-log'] });

      const statusLabel = data.targetStatus === 'en_transito' ? 'En Tránsito' : 'Pendiente';
      toast({
        title: "Estado revertido",
        description: `Despacho revertido a "${statusLabel}"`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "No se pudo revertir el estado",
        variant: "destructive"
      });
    }
  });

  return {
    revertDispatchStatus: revertMutation.mutate,
    isReverting: revertMutation.isPending,
  };
}
