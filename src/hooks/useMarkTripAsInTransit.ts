
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

export function useMarkTripAsInTransit() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const markTripAsInTransitMutation = useMutation({
    mutationFn: async ({ tripId, dispatchId }: { tripId: string; dispatchId: string }) => {
      console.log('🚀 [useMarkTripAsInTransit] Iniciando proceso para trip:', tripId, 'dispatch:', dispatchId);
      
      // Obtener solo los paquetes que pertenecen al despacho específico
      const { data: dispatchPackages, error: dispatchPackagesError } = await supabase
        .from('dispatch_packages')
        .select('package_id')
        .eq('dispatch_id', dispatchId);

      if (dispatchPackagesError) {
        console.error('❌ Error obteniendo dispatch_packages:', dispatchPackagesError);
        throw dispatchPackagesError;
      }

      if (!dispatchPackages || dispatchPackages.length === 0) {
        throw new Error('No packages found for this dispatch');
      }

      const packageIds = dispatchPackages.map(dp => dp.package_id);
      console.log('📦 [useMarkTripAsInTransit] Package IDs del despacho:', packageIds);

      // Obtener los paquetes del despacho que están en estado "procesado" o "despachado"
      const { data: packages, error: packagesError } = await supabase
        .from('packages')
        .select('id, tracking_number')
        .eq('trip_id', tripId)
        .in('id', packageIds)
        .in('status', ['procesado', 'despachado']);

      if (packagesError) {
        console.error('❌ Error obteniendo paquetes:', packagesError);
        throw packagesError;
      }

      if (!packages || packages.length === 0) {
        throw new Error('No packages found in "procesado" or "despachado" status for this dispatch');
      }

      console.log('📦 [useMarkTripAsInTransit] Paquetes encontrados:', packages);

      // Update only packages from this specific dispatch to "transito" status
      const { error: updateError } = await supabase
        .from('packages')
        .update({
          status: 'transito',
          updated_at: new Date().toISOString()
        })
        .in('id', packages.map(pkg => pkg.id));

      if (updateError) {
        console.error('❌ Error actualizando paquetes:', updateError);
        throw updateError;
      }

      console.log('✅ [useMarkTripAsInTransit] Paquetes actualizados a transito');

      // Update only the specific dispatch status to "en_transito"
      const { error: dispatchUpdateError } = await supabase
        .from('dispatch_relations')
        .update({
          status: 'en_transito',
          updated_at: new Date().toISOString()
        })
        .eq('id', dispatchId);

      if (dispatchUpdateError) {
        console.error('❌ Error actualizando dispatch_relations:', dispatchUpdateError);
        throw dispatchUpdateError;
      }

      console.log('✅ [useMarkTripAsInTransit] Despacho actualizado a en_transito');

      // Create tracking events only for packages in this dispatch
      const trackingEvents = packages.map(pkg => ({
        package_id: pkg.id,
        event_type: 'in_transit',
        description: 'Paquete en tránsito',
        location: 'En vuelo'
      }));

      const { error: trackingError } = await supabase
        .from('tracking_events')
        .insert(trackingEvents);

      if (trackingError) {
        console.error('❌ Error creando tracking events:', trackingError);
        throw trackingError;
      }

      // Update trip status to "in_progress" only if this is the first dispatch being marked as in transit
      const { data: otherDispatches, error: otherDispatchesError } = await supabase
        .from('dispatch_packages')
        .select(`
          dispatch_id,
          dispatch_relations!inner(status)
        `)
        .neq('dispatch_id', dispatchId)
        .eq('packages.trip_id', tripId);

      if (otherDispatchesError) {
        console.error('❌ Error verificando otros despachos:', otherDispatchesError);
        // Continue anyway, this is not critical
      }

      // Check if we should update the trip status
      const shouldUpdateTrip = !otherDispatches || otherDispatches.length === 0 || 
        otherDispatches.every(d => d.dispatch_relations?.status !== 'en_transito');

      if (shouldUpdateTrip) {
        const { error: tripUpdateError } = await supabase
          .from('trips')
          .update({
            status: 'in_progress',
            updated_at: new Date().toISOString()
          })
          .eq('id', tripId);

        if (tripUpdateError) {
          console.error('❌ Error actualizando trip:', tripUpdateError);
          throw tripUpdateError;
        }

        console.log('✅ [useMarkTripAsInTransit] Trip actualizado a in_progress');
      }

      console.log('✅ [useMarkTripAsInTransit] Proceso completado exitosamente');
      return { updatedPackages: packages.length, tripId, dispatchId };
    },
    onSuccess: (data) => {
      console.log('🎉 [useMarkTripAsInTransit] Mutación exitosa, invalidando queries');
      
      // Invalidar todas las queries relevantes inmediatamente
      queryClient.invalidateQueries({ queryKey: ['trips-with-flights'] });
      queryClient.invalidateQueries({ queryKey: ['packages'] });
      queryClient.invalidateQueries({ queryKey: ['packages-by-date'] });
      queryClient.invalidateQueries({ queryKey: ['dispatch-relations'] });
      queryClient.invalidateQueries({ queryKey: ['dispatch-packages'] });
      
      // También invalidar por ID específico del trip y dispatch
      queryClient.invalidateQueries({ queryKey: ['packages-by-trip', data.tripId] });
      queryClient.invalidateQueries({ queryKey: ['dispatch-packages', data.dispatchId] });
      
      // Invalidar por fecha actual
      const today = format(new Date(), 'yyyy-MM-dd');
      queryClient.invalidateQueries({ queryKey: ['packages-by-date', today] });
      queryClient.invalidateQueries({ queryKey: ['dispatch-relations', today] });
      
      // Refetch inmediato para actualización dinámica
      queryClient.refetchQueries({ queryKey: ['dispatch-relations'] });
      queryClient.refetchQueries({ queryKey: ['dispatch-packages'] });
      
      toast({
        title: "Despacho marcado en tránsito",
        description: `${data.updatedPackages} paquetes actualizados a "En Tránsito"`,
      });
    },
    onError: (error: any) => {
      console.error('💥 [useMarkTripAsInTransit] Error en mutación:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo marcar el despacho como en tránsito",
        variant: "destructive"
      });
    }
  });

  return {
    markTripAsInTransit: markTripAsInTransitMutation.mutate,
    isMarkingAsInTransit: markTripAsInTransitMutation.isPending,
  };
}
