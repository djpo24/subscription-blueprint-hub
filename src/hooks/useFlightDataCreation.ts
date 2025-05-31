
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useFlightDataCreation() {
  const { toast } = useToast();

  const createFlightData = async (tripData: any) => {
    console.log('=== INICIO createFlightData ===');
    console.log('Datos del viaje recibidos:', tripData);
    
    if (!tripData.flight_number) {
      console.log('No hay número de vuelo, saltando creación de flight_data');
      return;
    }

    try {
      console.log('Creando flight_data para el vuelo:', tripData.flight_number);
      
      // Verificar si ya existe flight_data para este número de vuelo
      console.log('Verificando si existe flight_data...');
      const { data: existingFlight, error: checkError } = await supabase
        .from('flight_data')
        .select('id, flight_number')
        .eq('flight_number', tripData.flight_number)
        .maybeSingle();

      console.log('Resultado de verificación:', { existingFlight, checkError });

      if (checkError) {
        console.error('Error verificando flight_data existente:', checkError);
        throw checkError;
      }

      if (existingFlight) {
        console.log('Flight_data ya existe para el vuelo:', tripData.flight_number);
        toast({
          title: "Viaje creado",
          description: "El viaje ha sido creado y el vuelo ya está siendo monitoreado",
        });
        return;
      }
      
      // Preparar datos para flight_data
      const scheduledDeparture = new Date(tripData.trip_date);
      scheduledDeparture.setHours(6, 0, 0, 0); // Hora por defecto 6:00 AM
      
      const estimatedFlightDuration = 2 * 60 * 60 * 1000; // 2 horas por defecto
      const scheduledArrival = new Date(scheduledDeparture.getTime() + estimatedFlightDuration);

      const flightDataToInsert = {
        flight_number: tripData.flight_number,
        departure_airport: tripData.origin,
        arrival_airport: tripData.destination,
        scheduled_departure: scheduledDeparture.toISOString(),
        scheduled_arrival: scheduledArrival.toISOString(),
        status: 'scheduled',
        has_landed: false,
        notification_sent: false,
        airline: 'Avianca' // Valor por defecto
      };

      console.log('Insertando flight_data:', flightDataToInsert);

      const { data: flightData, error: flightError } = await supabase
        .from('flight_data')
        .insert(flightDataToInsert)
        .select()
        .single();

      console.log('Resultado de inserción:', { flightData, flightError });

      if (flightError) {
        console.error('Error creando flight_data:', flightError);
        toast({
          title: "Viaje creado",
          description: `El viaje se creó pero hubo un error configurando el monitoreo: ${flightError.message}`,
          variant: "destructive"
        });
        throw flightError;
      } else {
        console.log('Flight_data creado exitosamente:', flightData);
        toast({
          title: "Viaje creado",
          description: "El viaje ha sido creado y se ha iniciado el monitoreo del vuelo",
        });
      }
    } catch (error) {
      console.error('Error en createFlightData:', error);
      toast({
        title: "Error en monitoreo",
        description: `No se pudo configurar el monitoreo del vuelo: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        variant: "destructive"
      });
      throw error;
    } finally {
      console.log('=== FIN createFlightData ===');
    }
  };

  return { createFlightData };
}
