
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

      // Calcular prioridad basada en número de paquetes
      const { data: packageCount } = await supabase
        .from('packages')
        .select('id', { count: 'exact' })
        .eq('flight_number', flightNumber);
      
      const priority = Math.min(5, Math.max(1, Math.floor((packageCount?.length || 0) / 2) + 1));
      
      console.log(`Prioridad calculada para vuelo ${flightNumber}: ${priority} (basada en ${packageCount?.length || 0} paquetes)`);

      // Intentar obtener datos reales del vuelo desde la API con estrategia inteligente
      let flightDataFromAPI = null;
      try {
        console.log('Intentando obtener datos del vuelo con estrategia inteligente...');
        const response = await supabase.functions.invoke('get-flight-data', {
          body: { flightNumber, tripDate, priority }
        });

        if (response.data && !response.error) {
          flightDataFromAPI = response.data;
          console.log('Datos obtenidos con estrategia inteligente:', {
            source: flightDataFromAPI._fallback ? 'fallback' : 'api',
            status: flightDataFromAPI.flight_status
          });
        }
      } catch (error) {
        console.log('Error en estrategia inteligente, usando valores por defecto:', error);
      }

      // Crear las fechas basándose en la fecha real del viaje o datos obtenidos
      const tripDateObj = new Date(tripDate);
      
      let scheduledDeparture, scheduledArrival;
      
      if (flightDataFromAPI?.departure?.scheduled && flightDataFromAPI?.arrival?.scheduled) {
        // Usar horarios de los datos obtenidos (API o fallback inteligente)
        scheduledDeparture = new Date(flightDataFromAPI.departure.scheduled);
        scheduledArrival = new Date(flightDataFromAPI.arrival.scheduled);
      } else {
        // Usar horarios por defecto básicos
        scheduledDeparture = new Date(tripDateObj);
        scheduledDeparture.setHours(6, 0, 0, 0);
        
        scheduledArrival = new Date(tripDateObj);
        scheduledArrival.setHours(8, 0, 0, 0);
      }

      // Determinar el estado del vuelo
      const now = new Date();
      const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const flightDate = new Date(tripDateObj.getFullYear(), tripDateObj.getMonth(), tripDateObj.getDate());
      
      let status = 'scheduled';
      let hasLanded = false;
      let actualDeparture = null;
      let actualArrival = null;

      // Si tenemos datos de la estrategia inteligente, usarlos
      if (flightDataFromAPI) {
        actualDeparture = flightDataFromAPI.departure?.actual || null;
        actualArrival = flightDataFromAPI.arrival?.actual || null;
        
        switch (flightDataFromAPI.flight_status) {
          case 'landed':
          case 'arrived':
            status = 'arrived';
            hasLanded = true;
            break;
          case 'active':
          case 'en-route':
            status = 'in_flight';
            break;
          case 'cancelled':
            status = 'cancelled';
            break;
          case 'delayed':
            status = 'delayed';
            break;
        }
      } else {
        // Lógica basada en fecha como fallback final
        if (flightDate < todayDate) {
          status = 'arrived';
          hasLanded = true;
          actualDeparture = scheduledDeparture.toISOString();
          actualArrival = scheduledArrival.toISOString();
        } else if (flightDate.getTime() === todayDate.getTime()) {
          const currentHour = now.getHours();
          if (currentHour >= 8) {
            status = 'arrived';
            hasLanded = true;
            actualDeparture = scheduledDeparture.toISOString();
            actualArrival = scheduledArrival.toISOString();
          } else if (currentHour >= 6) {
            status = 'in_flight';
            actualDeparture = scheduledDeparture.toISOString();
          }
        }
      }

      console.log('Flight status calculated:', {
        flightDate: flightDate.toISOString(),
        todayDate: todayDate.toISOString(),
        status,
        hasLanded,
        actualDeparture,
        actualArrival,
        dataSource: flightDataFromAPI?._fallback ? 'fallback_inteligente' : flightDataFromAPI ? 'api' : 'fecha'
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
        airline: flightDataFromAPI?.airline?.name || 'Avianca'
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
