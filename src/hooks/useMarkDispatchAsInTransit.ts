
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

export function useMarkDispatchAsInTransit() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const markDispatchAsInTransitMutation = useMutation({
    mutationFn: async ({ dispatchId }: { dispatchId: string }) => {
      console.log('🚀 [useMarkDispatchAsInTransit] Iniciando proceso para dispatch:', dispatchId);
      
      // PASO 1: Verificar que el despacho existe
      const { data: dispatch, error: dispatchError } = await supabase
        .from('dispatch_relations')
        .select('*')
        .eq('id', dispatchId)
        .single();

      if (dispatchError || !dispatch) {
        console.error('❌ Error: Despacho no encontrado:', dispatchError);
        throw new Error('Despacho no encontrado');
      }

      console.log('📋 [useMarkDispatchAsInTransit] Despacho encontrado:', dispatch);

      // PASO 2: Obtener todos los paquetes del despacho
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

      // PASO 3: Filtrar paquetes que pueden cambiar a tránsito
      const eligiblePackages = packages.filter(pkg => 
        pkg.status === 'procesado' || pkg.status === 'despachado'
      );

      if (eligiblePackages.length === 0) {
        throw new Error('No hay paquetes elegibles para marcar en tránsito');
      }

      console.log('✅ [useMarkDispatchAsInTransit] Paquetes elegibles:', eligiblePackages);

      // PASO 4: Actualizar estado de los paquetes a "transito"
      const packageIds = eligiblePackages.map(pkg => pkg.id);
      
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

      console.log('✅ [useMarkDispatchAsInTransit] Paquetes actualizados a transito');

      // PASO 5: Actualizar estado del despacho a "en_transito"
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

      // PASO 6: Crear eventos de tracking
      const trackingEvents = eligiblePackages.map(pkg => ({
        package_id: pkg.id,
        event_type: 'in_transit',
        description: 'Paquete marcado en tránsito desde despacho',
        location: 'En vuelo'
      }));

      const { error: trackingError } = await supabase
        .from('tracking_events')
        .insert(trackingEvents);

      if (trackingError) {
        console.error('❌ Error creando tracking events:', trackingError);
        // No lanzar error aquí, es secundario
      }

      // PASO 7: Actualizar trip si es necesario
      const tripId = eligiblePackages[0]?.trip_id;
      if (tripId) {
        const { data: currentTrip } = await supabase
          .from('trips')
          .select('status')
          .eq('id', tripId)
          .single();

        if (currentTrip && currentTrip.status !== 'in_progress') {
          await supabase
            .from('trips')
            .update({
              status: 'in_progress',
              updated_at: new Date().toISOString()
            })
            .eq('id', tripId);

          console.log('✅ [useMarkDispatchAsInTransit] Trip actualizado a in_progress');
        }
      }

      console.log('🎉 [useMarkDispatchAsInTransit] Proceso completado exitosamente');
      
      return { 
        updatedPackages: eligiblePackages.length, 
        dispatchId,
        tripId 
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
      
      toast({
        title: "Despacho marcado en tránsito",
        description: `${data.updatedPackages} paquetes actualizados a "En Tránsito"`,
      });
    },
    onError: (error: any) => {
      console.error('💥 [useMarkDispatchAsInTransit] Error en mutación:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo marcar el despacho como en tránsito",
        variant: "destructive"
      });
    }
  });

  return {
    markDispatchAsInTransit: markDispatchAsInTransitMutation.mutate,
    isMarkingAsInTransit: markDispatchAsInTransitMutation.isPending,
  };
}
