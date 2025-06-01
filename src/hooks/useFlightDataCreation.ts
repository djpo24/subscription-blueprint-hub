
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useFlightDataCreation() {
  const queryClient = useQueryClient();

  const createFlightDataMutation = useMutation({
    mutationFn: async ({ tripDate, flightNumber, origin, destination }: {
      tripDate: string;
      flightNumber: string;
      origin: string;
      destination: string;
    }) => {
      console.log('Creating flight data for:', { tripDate, flightNumber, origin, destination });
      
      // Verificar si ya existe un vuelo con este número
      const { data: existingFlight } = await supabase
        .from('flight_data')
        .select('id, flight_number')
        .eq('flight_number', flightNumber)
        .single();

      if (existingFlight) {
        console.log('Flight already exists:', existingFlight);
        return existingFlight;
      }

      // Crear las fechas basándose en la fecha real del viaje
      const tripDateObj = new Date(tripDate);
      
      // Programar salida a las 6:00 AM del día del viaje
      const scheduledDeparture = new Date(tripDateObj);
      scheduledDeparture.setHours(6, 0, 0, 0);
      
      // Programar llegada a las 8:00 AM del día del viaje (2 horas de vuelo)
      const scheduledArrival = new Date(tripDateObj);
      scheduledArrival.setHours(8, 0, 0, 0);

      // Determinar el estado del vuelo basándose en la fecha actual
      const now = new Date();
      const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const flightDate = new Date(tripDateObj.getFullYear(), tripDateObj.getMonth(), tripDateObj.getDate());
      
      let status = 'scheduled';
      let hasLanded = false;
      let actualDeparture = null;
      let actualArrival = null;

      // Si la fecha del vuelo es anterior a hoy, el vuelo ya debería haber llegado
      if (flightDate < todayDate) {
        status = 'arrived';
        hasLanded = true;
        // Simular que salió y llegó en los horarios programados
        actualDeparture = scheduledDeparture.toISOString();
        actualArrival = scheduledArrival.toISOString();
      } else if (flightDate.getTime() === todayDate.getTime()) {
        // Si es hoy, verificar la hora actual
        const currentHour = now.getHours();
        if (currentHour >= 8) {
          // Ya debería haber llegado
          status = 'arrived';
          hasLanded = true;
          actualDeparture = scheduledDeparture.toISOString();
          actualArrival = scheduledArrival.toISOString();
        } else if (currentHour >= 6) {
          // Está en vuelo
          status = 'in_flight';
          actualDeparture = scheduledDeparture.toISOString();
        }
      }

      console.log('Flight status calculated:', {
        flightDate: flightDate.toISOString(),
        todayDate: todayDate.toISOString(),
        status,
        hasLanded,
        actualDeparture,
        actualArrival
      });

      const flightData = {
        flight_number: flightNumber,
        departure_airport: origin,
        arrival_airport: destination,
        scheduled_departure: scheduledDeparture.toISOString(),
        scheduled_arrival: scheduledArrival.toISOString(),
        actual_departure: actualDeparture,
        actual_arrival: actualArrival,
        status,
        has_landed: hasLanded,
        notification_sent: false,
        airline: 'Avianca'
      };

      console.log('Creating flight with data:', flightData);

      const { data, error } = await supabase
        .from('flight_data')
        .insert(flightData)
        .select()
        .single();

      if (error) {
        console.error('Error creating flight data:', error);
        throw error;
      }

      console.log('Flight data created successfully:', data);
      return data;
    },
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
