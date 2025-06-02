
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useTripActions() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const markTripAsInTransitMutation = useMutation({
    mutationFn: async (tripId: string) => {
      // Get all packages that are "procesado" (dispatched but not in transit) for this trip
      const { data: packages, error: packagesError } = await supabase
        .from('packages')
        .select('id, tracking_number')
        .eq('trip_id', tripId)
        .eq('status', 'procesado');

      if (packagesError) throw packagesError;

      if (!packages || packages.length === 0) {
        throw new Error('No packages found in "procesado" status for this trip');
      }

      // Update all packages to "transito" status
      const { error: updateError } = await supabase
        .from('packages')
        .update({
          status: 'transito',
          updated_at: new Date().toISOString()
        })
        .eq('trip_id', tripId)
        .eq('status', 'procesado');

      if (updateError) throw updateError;

      // Update dispatch status to "en_transito" for all dispatches containing these packages
      const packageIds = packages.map(pkg => pkg.id);
      const { data: dispatchPackages, error: dispatchPackagesError } = await supabase
        .from('dispatch_packages')
        .select('dispatch_id')
        .in('package_id', packageIds);

      if (dispatchPackagesError) throw dispatchPackagesError;

      if (dispatchPackages && dispatchPackages.length > 0) {
        const dispatchIds = [...new Set(dispatchPackages.map(dp => dp.dispatch_id))];
        const { error: dispatchUpdateError } = await supabase
          .from('dispatch_relations')
          .update({
            status: 'en_transito',
            updated_at: new Date().toISOString()
          })
          .in('id', dispatchIds);

        if (dispatchUpdateError) throw dispatchUpdateError;
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

      if (trackingError) throw trackingError;

      // Update trip status to "in_progress"
      const { error: tripUpdateError } = await supabase
        .from('trips')
        .update({
          status: 'in_progress',
          updated_at: new Date().toISOString()
        })
        .eq('id', tripId);

      if (tripUpdateError) throw tripUpdateError;

      return { updatedPackages: packages.length };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['trips-with-flights'] });
      queryClient.invalidateQueries({ queryKey: ['packages'] });
      queryClient.invalidateQueries({ queryKey: ['dispatch-relations'] });
      toast({
        title: "Viaje marcado en tránsito",
        description: `${data.updatedPackages} paquetes actualizados a "En Tránsito"`,
      });
    },
    onError: (error: any) => {
      console.error('Error marking trip as in transit:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo marcar el viaje como en tránsito",
        variant: "destructive"
      });
    }
  });

  const markTripAsArrivedMutation = useMutation({
    mutationFn: async (tripId: string) => {
      // Get all packages in transit for this trip
      const { data: packages, error: packagesError } = await supabase
        .from('packages')
        .select('id, tracking_number')
        .eq('trip_id', tripId)
        .eq('status', 'transito');

      if (packagesError) throw packagesError;

      if (!packages || packages.length === 0) {
        throw new Error('No packages in transit found for this trip');
      }

      // Update all packages to "en_destino" status
      const { error: updateError } = await supabase
        .from('packages')
        .update({
          status: 'en_destino',
          updated_at: new Date().toISOString()
        })
        .eq('trip_id', tripId)
        .eq('status', 'transito');

      if (updateError) throw updateError;

      // Update dispatch status to "llegado" for all dispatches containing these packages
      const packageIds = packages.map(pkg => pkg.id);
      const { data: dispatchPackages, error: dispatchPackagesError } = await supabase
        .from('dispatch_packages')
        .select('dispatch_id')
        .in('package_id', packageIds);

      if (dispatchPackagesError) throw dispatchPackagesError;

      if (dispatchPackages && dispatchPackages.length > 0) {
        const dispatchIds = [...new Set(dispatchPackages.map(dp => dp.dispatch_id))];
        const { error: dispatchUpdateError } = await supabase
          .from('dispatch_relations')
          .update({
            status: 'llegado',
            updated_at: new Date().toISOString()
          })
          .in('id', dispatchIds);

        if (dispatchUpdateError) throw dispatchUpdateError;
      }

      // Create tracking events for each package
      const trackingEvents = packages.map(pkg => ({
        package_id: pkg.id,
        event_type: 'arrived',
        description: 'Paquete llegó a destino',
        location: 'Destino'
      }));

      const { error: trackingError } = await supabase
        .from('tracking_events')
        .insert(trackingEvents);

      if (trackingError) throw trackingError;

      // Update trip status to "completed"
      const { error: tripUpdateError } = await supabase
        .from('trips')
        .update({
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', tripId);

      if (tripUpdateError) throw tripUpdateError;

      return { updatedPackages: packages.length };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['trips-with-flights'] });
      queryClient.invalidateQueries({ queryKey: ['packages'] });
      queryClient.invalidateQueries({ queryKey: ['dispatch-relations'] });
      toast({
        title: "Viaje marcado como llegado",
        description: `${data.updatedPackages} paquetes actualizados a "En Destino"`,
      });
    },
    onError: (error: any) => {
      console.error('Error marking trip as arrived:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo marcar el viaje como llegado",
        variant: "destructive"
      });
    }
  });

  return {
    markTripAsInTransit: markTripAsInTransitMutation.mutate,
    isMarkingAsInTransit: markTripAsInTransitMutation.isPending,
    markTripAsArrived: markTripAsArrivedMutation.mutate,
    isMarkingAsArrived: markTripAsArrivedMutation.isPending,
  };
}
