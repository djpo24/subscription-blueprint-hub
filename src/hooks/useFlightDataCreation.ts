
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { FlightData } from '@/types/flight';

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
          console.log('🎯 Datos COMPLETOS obtenidos de la API:', {
            source: flightDataFromAPI._fallback ? 'fallback' : 'api',
            flight_status: flightDataFromAPI.flight_status,
            api_departure_city: flightDataFromAPI.api_departure_city,
            api_arrival_city: flightDataFromAPI.api_arrival_city,
            api_departure_airport: flightDataFromAPI.api_departure_airport,
            api_arrival_airport: flightDataFromAPI.api_arrival_airport,
            api_departure_gate: flightDataFromAPI.api_departure_gate,
            api_arrival_gate: flightDataFromAPI.api_arrival_gate,
            api_departure_terminal: flightDataFromAPI.api_departure_terminal,
            api_arrival_terminal: flightDataFromAPI.api_arrival_terminal,
            api_aircraft: flightDataFromAPI.api_aircraft,
            departure_scheduled: flightDataFromAPI.departure?.scheduled,
            departure_actual: flightDataFromAPI.departure?.actual,
            arrival_scheduled: flightDataFromAPI.arrival?.scheduled,
            arrival_actual: flightDataFromAPI.arrival?.actual
          });
        }
      } catch (error) {
        console.log('Error en estrategia inteligente, usando valores por defecto:', error);
      }

      // Crear las fechas basándose en la fecha real del viaje o datos obtenidos
      const tripDateObj = new Date(tripDate);
      
      let scheduledDeparture, scheduledArrival;
      
      if (flightDataFromAPI?.departure?.scheduled && flightDataFromAPI?.arrival?.scheduled) {
        // Usar horarios EXACTOS de la API sin conversiones
        scheduledDeparture = new Date(flightDataFromAPI.departure.scheduled);
        scheduledArrival = new Date(flightDataFromAPI.arrival.scheduled);
        console.log('📅 Usando horarios REALES de API (sin conversión):', {
          scheduled_departure: flightDataFromAPI.departure.scheduled,
          scheduled_arrival: flightDataFromAPI.arrival.scheduled
        });
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

      // Si tenemos datos de la estrategia inteligente, usarlos EXACTAMENTE
      if (flightDataFromAPI) {
        // Usar horarios REALES exactos de la API sin conversiones
        actualDeparture = flightDataFromAPI.departure?.actual || null;
        actualArrival = flightDataFromAPI.arrival?.actual || null;
        
        console.log('⏰ Horarios REALES de API (exactos):', {
          actual_departure: actualDeparture,
          actual_arrival: actualArrival
        });
        
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

      // Usar datos de aeropuerto de la API si están disponibles, sino usar los del viaje
      const departureAirport = flightDataFromAPI?.api_departure_airport || origin;
      const arrivalAirport = flightDataFromAPI?.api_arrival_airport || destination;

      const flightData = {
        flight_number: flightNumber,
        departure_airport: departureAirport,
        arrival_airport: arrivalAirport,
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

      // Si tenemos datos de la API, agregar TODOS los campos adicionales al objeto retornado
      const enrichedData = data as FlightData;
      
      if (flightDataFromAPI) {
        enrichedData.api_departure_airport = flightDataFromAPI.api_departure_airport;
        enrichedData.api_arrival_airport = flightDataFromAPI.api_arrival_airport;
        enrichedData.api_departure_city = flightDataFromAPI.api_departure_city;
        enrichedData.api_arrival_city = flightDataFromAPI.api_arrival_city;
        enrichedData.api_departure_gate = flightDataFromAPI.api_departure_gate;
        enrichedData.api_arrival_gate = flightDataFromAPI.api_arrival_gate;
        enrichedData.api_departure_terminal = flightDataFromAPI.api_departure_terminal;
        enrichedData.api_arrival_terminal = flightDataFromAPI.api_arrival_terminal;
        enrichedData.api_aircraft = flightDataFromAPI.api_aircraft;
        enrichedData.api_flight_status = flightDataFromAPI.api_flight_status;
      }

      console.log('🎯 Flight data created successfully with COMPLETE API data:', enrichedData);
      return enrichedData;
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
