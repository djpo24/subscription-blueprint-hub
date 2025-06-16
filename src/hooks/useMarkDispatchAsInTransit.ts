
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useMarkDispatchAsInTransit() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const markDispatchAsInTransitMutation = useMutation({
    mutationFn: async ({ dispatchId }: { dispatchId: string }) => {
      console.log('🚀 [useMarkDispatchAsInTransit] Iniciando proceso para dispatch:', dispatchId);

      // PASO 1: Verificar que el despacho existe y está en estado correcto
      const { data: dispatch, error: dispatchError } = await supabase
        .from('dispatch_relations')
        .select('*')
        .eq('id', dispatchId)
        .single();

      if (dispatchError || !dispatch) {
        console.error('❌ Error: Despacho no encontrado:', dispatchError);
        throw new Error('Despacho no encontrado');
      }

      // VALIDACIÓN CRÍTICA: Solo permitir transición desde estados válidos
      if (dispatch.status !== 'procesado' && dispatch.status !== 'pending') {
        console.error('❌ Error: Estado de despacho inválido para transición:', dispatch.status);
        throw new Error(`No se puede marcar en tránsito desde estado: ${dispatch.status}`);
      }

      console.log('📋 [useMarkDispatchAsInTransit] Despacho encontrado con estado válido:', dispatch);

      // PASO 2: Obtener SOLO los paquetes de este despacho específico
      const { data: dispatchPackages, error: packagesError } = await supabase
        .from('dispatch_packages')
        .select(`
          package_id,
          packages!package_id (
            id,
            tracking_number,
            status,
            trip_id
          )
        `)
        .eq('dispatch_id', dispatchId);

      if (packagesError) {
        console.error('❌ Error obteniendo paquetes del despacho:', packagesError);
        throw packagesError;
      }

      if (!dispatchPackages || dispatchPackages.length === 0) {
        throw new Error('No se encontraron paquetes en este despacho');
      }

      const packages = dispatchPackages
        .map(dp => dp.packages)
        .filter(Boolean);

      console.log('📦 [useMarkDispatchAsInTransit] Paquetes del despacho:', packages);

      // PASO 3: VALIDACIÓN CRÍTICA - Filtrar paquetes que están en estado válido para transición
      const packagesReadyForTransit = packages.filter(pkg => 
        pkg.status === 'despachado' || pkg.status === 'procesado'
      );

      if (packagesReadyForTransit.length === 0) {
        console.error('❌ Error: No hay paquetes en estado válido para transición:', 
          packages.map(p => `${p.tracking_number}: ${p.status}`));
        throw new Error('No hay paquetes listos para tránsito en este despacho. Estados válidos: despachado, procesado');
      }

      // Reportar paquetes con estados inválidos
      const invalidPackages = packages.filter(pkg => 
        pkg.status !== 'despachado' && pkg.status !== 'procesado'
      );
      
      if (invalidPackages.length > 0) {
        console.warn('⚠️ [useMarkDispatchAsInTransit] Paquetes con estados inválidos (no se actualizarán):', 
          invalidPackages.map(p => `${p.tracking_number}: ${p.status}`));
      }

      console.log('✅ [useMarkDispatchAsInTransit] Paquetes válidos para tránsito:', packagesReadyForTransit);

      // PASO 4: Actualizar SOLO los paquetes válidos a "transito"
      const packageIds = packagesReadyForTransit.map(pkg => pkg.id);
      
      const { error: updatePackagesError } = await supabase
        .from('packages')
        .update({
          status: 'transito',
          updated_at: new Date().toISOString()
        })
        .in('id', packageIds);

      if (updatePackagesError) {
        console.error('❌ Error actualizando paquetes:', updatePackagesError);
        throw updatePackagesError;
      }

      console.log('✅ [useMarkDispatchAsInTransit] Paquetes actualizados a tránsito');

      // PASO 5: Actualizar SOLO este despacho específico a "en_transito"
      const { error: updateDispatchError } = await supabase
        .from('dispatch_relations')
        .update({
          status: 'en_transito',
          updated_at: new Date().toISOString()
        })
        .eq('id', dispatchId);

      if (updateDispatchError) {
        console.error('❌ Error actualizando estado del despacho:', updateDispatchError);
        throw updateDispatchError;
      }

      console.log('✅ [useMarkDispatchAsInTransit] Despacho actualizado a en_transito');

      // PASO 6: Crear eventos de tracking SOLO para los paquetes válidos
      const trackingEvents = packagesReadyForTransit.map(pkg => ({
        package_id: pkg.id,
        event_type: 'in_transit',
        description: 'Paquete en tránsito desde despacho (transición validada)',
        location: 'En tránsito'
      }));

      const { error: trackingError } = await supabase
        .from('tracking_events')
        .insert(trackingEvents);

      if (trackingError) {
        console.error('❌ Error creando tracking events:', trackingError);
        // No lanzar error aquí, es secundario
      }

      console.log('🎉 [useMarkDispatchAsInTransit] Proceso completado exitosamente');
      
      return { 
        updatedPackages: packagesReadyForTransit.length,
        invalidPackages: invalidPackages.length,
        dispatchId 
      };
    },
    onSuccess: (data) => {
      console.log('🎉 [useMarkDispatchAsInTransit] Mutación exitosa, invalidando queries');
      
      // Invalidar todas las queries relevantes
      queryClient.invalidateQueries({ queryKey: ['dispatch-relations'] });
      queryClient.invalidateQueries({ queryKey: ['dispatch-packages'] });
      queryClient.invalidateQueries({ queryKey: ['packages'] });
      queryClient.invalidateQueries({ queryKey: ['packages-by-date'] });
      queryClient.invalidateQueries({ queryKey: ['trips-with-flights'] });
      
      // Invalidar por ID específico
      queryClient.invalidateQueries({ queryKey: ['dispatch-packages', data.dispatchId] });
      
      // Refetch inmediato
      queryClient.refetchQueries({ queryKey: ['dispatch-relations'] });
      queryClient.refetchQueries({ queryKey: ['dispatch-packages', data.dispatchId] });
      
      let message = `${data.updatedPackages} paquetes actualizados a "En Tránsito"`;
      if (data.invalidPackages > 0) {
        message += `. ${data.invalidPackages} paquetes no se actualizaron por estar en estado inválido.`;
      }
      
      toast({
        title: "Despacho marcado en tránsito",
        description: message,
      });
    },
    onError: (error: any) => {
      console.error('💥 [useMarkDispatchAsInTransit] Error en mutación:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo marcar el despacho en tránsito",
        variant: "destructive"
      });
    }
  });

  return {
    markDispatchAsInTransit: markDispatchAsInTransitMutation.mutate,
    isMarkingAsInTransit: markDispatchAsInTransitMutation.isPending,
  };
}
