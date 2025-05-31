
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

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
    onSuccess: async (data) => {
      console.log('Trip created successfully:', data);
      
      // Si el viaje tiene número de vuelo, crear datos de monitoreo
      if (data.flight_number) {
        try {
          console.log('Creating flight data for monitoring:', data.flight_number);
          
          const scheduledDeparture = new Date(data.trip_date);
          scheduledDeparture.setHours(6, 0, 0, 0); // Hora por defecto 6:00 AM
          
          const estimatedFlightDuration = 2 * 60 * 60 * 1000; // 2 horas por defecto
          const scheduledArrival = new Date(scheduledDeparture.getTime() + estimatedFlightDuration);

          const { data: flightData, error: flightError } = await supabase
            .from('flight_data')
            .insert({
              flight_number: data.flight_number,
              departure_airport: data.origin,
              arrival_airport: data.destination,
              scheduled_departure: scheduledDeparture.toISOString(),
              scheduled_arrival: scheduledArrival.toISOString(),
              status: 'scheduled',
              has_landed: false,
              notification_sent: false
            })
            .select()
            .single();

          if (flightError) {
            console.error('Error creating flight data:', flightError);
            toast({
              title: "Advertencia",
              description: "El viaje se creó pero no se pudo configurar el monitoreo del vuelo",
              variant: "destructive"
            });
          } else {
            console.log('Flight data created successfully:', flightData);
            toast({
              title: "Viaje creado",
              description: "El viaje ha sido creado y se ha iniciado el monitoreo del vuelo",
            });
          }
        } catch (error) {
          console.error('Error in flight data creation:', error);
          toast({
            title: "Advertencia",
            description: "El viaje se creó pero no se pudo configurar el monitoreo del vuelo",
            variant: "destructive"
          });
        }
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

    // Validar formato de ruta
    if (!formData.route.includes(' -> ')) {
      toast({
        title: "Error",
        description: "Por favor selecciona una ruta válida",
        variant: "destructive"
      });
      return;
    }

    const routeParts = formData.route.split(' -> ');
    if (routeParts.length !== 2 || !routeParts[0] || !routeParts[1]) {
      toast({
        title: "Error",
        description: "Formato de ruta inválido",
        variant: "destructive"
      });
      return;
    }

    const [origin, destination] = routeParts;
    
    // Usar format de date-fns para evitar problemas de zona horaria
    const tripDate = format(date, 'yyyy-MM-dd');
    
    const tripData = {
      trip_date: tripDate,
      origin: origin.trim(),
      destination: destination.trim(),
      flight_number: formData.flight_number.trim() || null,
      status: 'scheduled'
    };

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
