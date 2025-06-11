
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

export function useMarkTripAsInTransit() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const markTripAsInTransitMutation = useMutation({
    mutationFn: async (tripId: string) => {
      console.log('🚀 [useMarkTripAsInTransit] Iniciando proceso para trip:', tripId);
      
      // Actualizar para incluir el estado "despachado" además de "procesado"
      const { data: packages, error: packagesError } = await supabase
        .from('packages')
        .select('id, tracking_number')
        .eq('trip_id', tripId)
        .in('status', ['procesado', 'despachado']);

      if (packagesError) {
        console.error('❌ Error obteniendo paquetes:', packagesError);
        throw packagesError;
      }

      if (!packages || packages.length === 0) {
        throw new Error('No packages found in "procesado" or "despachado" status for this trip');
      }

      console.log('📦 [useMarkTripAsInTransit] Paquetes encontrados:', packages);

      // Update all packages to "transito" status
      const { error: updateError } = await supabase
        .from('packages')
        .update({
          status: 'transito',
          updated_at: new Date().toISOString()
        })
        .eq('trip_id', tripId)
        .in('status', ['procesado', 'despachado']);

      if (updateError) {
        console.error('❌ Error actualizando paquetes:', updateError);
        throw updateError;
      }

      console.log('✅ [useMarkTripAsInTransit] Paquetes actualizados a transito');

      // Obtener los despachos que contienen estos paquetes
      const packageIds = packages.map(pkg => pkg.id);
      const { data: dispatchPackages, error: dispatchPackagesError } = await supabase
        .from('dispatch_packages')
        .select('dispatch_id')
        .in('package_id', packageIds);

      if (dispatchPackagesError) {
        console.error('❌ Error obteniendo dispatch_packages:', dispatchPackagesError);
        throw dispatchPackagesError;
      }

      console.log('📋 [useMarkTripAsInTransit] Dispatch packages encontrados:', dispatchPackages);

      if (dispatchPackages && dispatchPackages.length > 0) {
        const dispatchIds = [...new Set(dispatchPackages.map(dp => dp.dispatch_id))];
        console.log('🎯 [useMarkTripAsInTransit] Actualizando despachos:', dispatchIds);
        
        const { error: dispatchUpdateError } = await supabase
          .from('dispatch_relations')
          .update({
            status: 'en_transito',
            updated_at: new Date().toISOString()
          })
          .in('id', dispatchIds);

        if (dispatchUpdateError) {
          console.error('❌ Error actualizando dispatch_relations:', dispatchUpdateError);
          throw dispatchUpdateError;
        }

        console.log('✅ [useMarkTripAsInTransit] Despachos actualizados a en_transito');
      }

      // Create tracking events for each package
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

      // Update trip status to "in_progress"
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

      console.log('✅ [useMarkTripAsInTransit] Proceso completado exitosamente');
      return { updatedPackages: packages.length, tripId };
    },
    onSuccess: (data) => {
      console.log('🎉 [useMarkTripAsInTransit] Mutación exitosa, invalidando queries');
      
      // Invalidar todas las queries relevantes inmediatamente
      queryClient.invalidateQueries({ queryKey: ['trips-with-flights'] });
      queryClient.invalidateQueries({ queryKey: ['packages'] });
      queryClient.invalidateQueries({ queryKey: ['packages-by-date'] });
      queryClient.invalidateQueries({ queryKey: ['dispatch-relations'] });
      queryClient.invalidateQueries({ queryKey: ['dispatch-packages'] });
      
      // También invalidar por ID específico del trip
      queryClient.invalidateQueries({ queryKey: ['packages-by-trip', data.tripId] });
      
      // Invalidar por fecha actual
      const today = format(new Date(), 'yyyy-MM-dd');
      queryClient.invalidateQueries({ queryKey: ['packages-by-date', today] });
      queryClient.invalidateQueries({ queryKey: ['dispatch-relations', today] });
      
      // Refetch inmediato para actualización dinámica
      queryClient.refetchQueries({ queryKey: ['dispatch-relations'] });
      queryClient.refetchQueries({ queryKey: ['dispatch-packages'] });
      
      toast({
        title: "Viaje marcado en tránsito",
        description: `${data.updatedPackages} paquetes actualizados a "En Tránsito"`,
      });
    },
    onError: (error: any) => {
      console.error('💥 [useMarkTripAsInTransit] Error en mutación:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo marcar el viaje como en tránsito",
        variant: "destructive"
      });
    }
  });

  return {
    markTripAsInTransit: markTripAsInTransitMutation.mutate,
    isMarkingAsInTransit: markTripAsInTransitMutation.isPending,
  };
}
