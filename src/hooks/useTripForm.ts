import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { TripFormData } from '@/types/tripForm';
import { createTrip, prepareTripData } from '@/services/tripService';
import { useFlightCreationMutation } from '@/hooks/useFlightCreationMutation';
import { useTripFormValidation } from '@/hooks/useTripFormValidation';

export function useTripForm(onSuccess: () => void) {
  const [formData, setFormData] = useState<TripFormData>({
    route: '',
    flight_number: ''
  });

  const [date, setDate] = useState<Date>();
  const today = new Date();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { createFlightData } = useFlightCreationMutation();
  const { validateForm } = useTripFormValidation();

  const updateFormData = (updates: Partial<TripFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const createTripMutation = useMutation({
    mutationFn: async (tripData: any) => {
      return await createTrip(tripData);
    },
    onSuccess: async (data) => {
      console.log('Trip created successfully:', data);
      
      // Si el viaje tiene número de vuelo, crear datos de monitoreo
      if (data.flight_number) {
        // Transform the database object to match createFlightData expectations
        await createFlightData({
          tripDate: data.trip_date,
          flightNumber: data.flight_number,
          origin: data.origin,
          destination: data.destination
        });
      } else {
        toast({
          title: "Viaje creado",
          description: "El viaje ha sido creado exitosamente",
        });
      }
      
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      queryClient.invalidateQueries({ queryKey: ['pending-flight-notifications'] });
      
      // Reset form
      setFormData({ route: '', flight_number: '' });
      setDate(undefined);
      onSuccess();
    },
    onError: (error: any) => {
      console.error('Error creating trip:', error);
      
      if (error.message === 'FLIGHT_EXISTS') {
        toast({
          title: "Número de vuelo ya existe",
          description: `Ya existe un viaje programado para ${format(date!, 'dd/MM/yyyy')} con el número de vuelo ${formData.flight_number}`,
          variant: "destructive"
        });
      } else if (error.code === '23505') {
        // Error de restricción única por ruta y fecha
        const routeParts = formData.route.split(' -> ');
        const [origin, destination] = routeParts;
        toast({
          title: "Viaje ya existe",
          description: `Ya existe un viaje programado para ${format(date!, 'dd/MM/yyyy')} en la ruta ${origin} → ${destination}`,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Error",
          description: "No se pudo crear el viaje. Por favor intente nuevamente.",
          variant: "destructive"
        });
      }
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm(date, formData)) {
      return;
    }

    const tripData = prepareTripData(formData, date!);
    console.log('Submitting trip data:', tripData);
    createTripMutation.mutate(tripData);
  };

  return {
    formData,
    updateFormData,
    date,
    setDate,
    today,
    isLoading: createTripMutation.isPending,
    handleSubmit
  };
}
