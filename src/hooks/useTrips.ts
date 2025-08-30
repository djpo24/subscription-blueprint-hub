
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useTrips() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data = [], isLoading: tripsLoading } = useQuery({
    queryKey: ['trips'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('trips')
        .select('*, travelers(*)')
        .order('trip_date', { ascending: false });

      if (error) throw error;
      return data || [];
    }
  });

  const createTripMutation = useMutation({
    mutationFn: async (tripDate: Date) => {
      const { data, error } = await supabase
        .from('trips')
        .insert({
          trip_date: tripDate.toISOString().split('T')[0],
          status: 'scheduled'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Viaje creado",
        description: "El viaje ha sido creado exitosamente"
      });
      queryClient.invalidateQueries({ queryKey: ['trips'] });
    }
  });

  const addPackageToTripMutation = useMutation({
    mutationFn: async (tripId: string) => {
      // Implementation for adding package to trip
      console.log('Adding package to trip:', tripId);
    },
    onSuccess: () => {
      toast({
        title: "Paquete agregado",
        description: "El paquete ha sido agregado al viaje"
      });
    }
  });

  return {
    data,
    trips: data,
    tripsLoading,
    createTrip: createTripMutation.mutate,
    addPackageToTrip: addPackageToTripMutation.mutate
  };
}
