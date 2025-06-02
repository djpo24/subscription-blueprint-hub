
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useTripActions() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

      return { updatedPackages: packages.length };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['trips-with-flights'] });
      queryClient.invalidateQueries({ queryKey: ['packages'] });
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
    markTripAsArrived: markTripAsArrivedMutation.mutate,
    isMarkingAsArrived: markTripAsArrivedMutation.isPending,
  };
}
