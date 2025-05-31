
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useFlightMonitor } from '@/hooks/useFlightMonitor';

interface TripFormData {
  route: string;
  flight_number: string;
}

export function useTripForm(onSuccess: () => void) {
  const [formData, setFormData] = useState<TripFormData>({
    route: '',
    flight_number: ''
  });

  const [date, setDate] = useState<Date>();
  const today = new Date();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { createFlightData } = useFlightMonitor();

  const updateFormData = (updates: Partial<TripFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const createTripMutation = useMutation({
    mutationFn: async (tripData: any) => {
      console.log('Creating trip with data:', tripData);
      
      const { data, error } = await supabase
        .from('trips')
        .insert([tripData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      console.log('Trip created successfully:', data);
      
      // Si el viaje tiene número de vuelo, crear datos de monitoreo
      if (data.flight_number) {
        const scheduledDeparture = new Date(data.trip_date);
        scheduledDeparture.setHours(6, 0, 0, 0); // Hora por defecto 6:00 AM
        
        createFlightData({
          flightNumber: data.flight_number,
          origin: data.origin,
          destination: data.destination,
          scheduledDeparture: scheduledDeparture.toISOString()
        });
      }
      
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      
      toast({
        title: "Viaje creado",
        description: data.flight_number 
          ? "El viaje ha sido creado y se ha iniciado el monitoreo del vuelo"
          : "El viaje ha sido creado exitosamente",
      });
      
      // Reset form
      setFormData({ route: '', flight_number: '' });
      setDate(undefined);
      onSuccess();
    },
    onError: (error: any) => {
      console.error('Error creating trip:', error);
      toast({
        title: "Error",
        description: "No se pudo crear el viaje",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!date || !formData.route) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos requeridos",
        variant: "destructive"
      });
      return;
    }

    const [origin, destination] = formData.route.split(' -> ');
    
    const tripData = {
      trip_date: date.toISOString().split('T')[0],
      origin: origin.trim(),
      destination: destination.trim(),
      flight_number: formData.flight_number.trim() || null,
      status: 'scheduled'
    };

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
