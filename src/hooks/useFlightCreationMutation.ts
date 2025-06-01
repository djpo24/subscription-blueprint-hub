
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createFlightDataService, CreateFlightDataParams } from '@/services/flightDataCreationService';

export function useFlightCreationMutation() {
  const queryClient = useQueryClient();

  const createFlightDataMutation = useMutation({
    mutationFn: createFlightDataService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips-with-flights'] });
      queryClient.invalidateQueries({ queryKey: ['pending-flight-notifications'] });
    }
  });

  return {
    createFlightData: createFlightDataMutation.mutate,
    isCreating: createFlightDataMutation.isPending,
  };
}
