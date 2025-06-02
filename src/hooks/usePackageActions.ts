
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function usePackageActions() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const reschedulePackageMutation = useMutation({
    mutationFn: async ({ packageId, newTripId }: { packageId: string; newTripId: string }) => {
      // Get trip details for origin and destination
      const { data: tripData, error: tripError } = await supabase
        .from('trips')
        .select('origin, destination, flight_number')
        .eq('id', newTripId)
        .single();

      if (tripError) throw tripError;

      // Update package with new trip information
      const { error: updateError } = await supabase
        .from('packages')
        .update({
          trip_id: newTripId,
          flight_number: tripData.flight_number,
          origin: tripData.origin,
          destination: tripData.destination,
          status: 'recibido', // Usar el nuevo estado
          updated_at: new Date().toISOString()
        })
        .eq('id', packageId);

      if (updateError) throw updateError;

      // Create tracking event
      await supabase
        .from('tracking_events')
        .insert([{
          package_id: packageId,
          event_type: 'rescheduled',
          description: `Encomienda reprogramada para viaje a ${tripData.destination}`,
          location: tripData.origin
        }]);

      return { packageId, newTripId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packages'] });
      toast({
        title: "Encomienda reprogramada",
        description: "La encomienda ha sido reprogramada exitosamente",
      });
    },
    onError: (error: any) => {
      console.error('Error rescheduling package:', error);
      toast({
        title: "Error",
        description: "No se pudo reprogramar la encomienda",
        variant: "destructive"
      });
    }
  });

  const moveToWarehouseMutation = useMutation({
    mutationFn: async (packageId: string) => {
      // Update package to warehouse status and remove trip assignment
      const { error: updateError } = await supabase
        .from('packages')
        .update({
          status: 'bodega', // Usar el nuevo estado
          trip_id: null,
          flight_number: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', packageId);

      if (updateError) throw updateError;

      // Create tracking event
      await supabase
        .from('tracking_events')
        .insert([{
          package_id: packageId,
          event_type: 'warehouse',
          description: 'Encomienda movida a bodega',
          location: 'Bodega'
        }]);

      return packageId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packages'] });
      toast({
        title: "Encomienda en bodega",
        description: "La encomienda ha sido movida a bodega",
      });
    },
    onError: (error: any) => {
      console.error('Error moving package to warehouse:', error);
      toast({
        title: "Error",
        description: "No se pudo mover la encomienda a bodega",
        variant: "destructive"
      });
    }
  });

  return {
    reschedulePackage: async (packageId: string, newTripId: string) => {
      try {
        await reschedulePackageMutation.mutateAsync({ packageId, newTripId });
        return true;
      } catch {
        return false;
      }
    },
    moveToWarehouse: moveToWarehouseMutation.mutate,
    isRescheduling: reschedulePackageMutation.isPending,
    isMovingToWarehouse: moveToWarehouseMutation.isPending,
  };
}
