
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { TripFormData } from '@/types/tripForm';
import { createTrip, prepareTripData } from '@/services/tripService';
import { useFlightDataCreation } from '@/hooks/useFlightDataCreation';
import { useTripFormValidation } from '@/hooks/useTripFormValidation';

export function useTripForm(onSuccess: () => void, initialDate?: Date) {
  const [formData, setFormData] = useState<TripFormData>({
    route: '',
    flight_number: '',
    traveler_id: ''
  });

  // Inicializar la fecha correctamente
  const [date, setDate] = useState<Date | undefined>(initialDate);
  const today = new Date();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { createFlightData } = useFlightDataCreation();
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
        await createFlightData(data);
      } else {
        toast({
          title: "Viaje creado",
          description: "El viaje ha sido creado exitosamente",
        });
      }
      
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      queryClient.invalidateQueries({ queryKey: ['pending-flight-notifications'] });
      
      // Reset form
      setFormData({ route: '', flight_number: '', traveler_id: '' });
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
    
    // Usar la fecha preseleccionada si existe, sino usar el estado date
    const finalDate = initialDate || date;
    
    console.log('Validating form with:', { finalDate, formData });
    
    if (!validateForm(finalDate, formData)) {
      return;
    }

    const tripData = prepareTripData(formData, finalDate!);
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
