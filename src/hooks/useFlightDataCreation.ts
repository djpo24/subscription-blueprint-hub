
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useFlightDataCreation() {
  const { toast } = useToast();

  const createFlightData = async (tripData: any) => {
    if (!tripData.flight_number) {
      console.log('No flight number provided, skipping flight data creation');
      return;
    }

    try {
      console.log('Creating flight data for monitoring:', tripData.flight_number);
      
      // Check if flight data already exists for this flight number
      const { data: existingFlight, error: checkError } = await supabase
        .from('flight_data')
        .select('id')
        .eq('flight_number', tripData.flight_number)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking existing flight data:', checkError);
      }

      if (existingFlight) {
        console.log('Flight data already exists for flight:', tripData.flight_number);
        toast({
          title: "Viaje creado",
          description: "El viaje ha sido creado y el vuelo ya está siendo monitoreado",
        });
        return;
      }
      
      const scheduledDeparture = new Date(tripData.trip_date);
      scheduledDeparture.setHours(6, 0, 0, 0); // Hora por defecto 6:00 AM
      
      const estimatedFlightDuration = 2 * 60 * 60 * 1000; // 2 horas por defecto
      const scheduledArrival = new Date(scheduledDeparture.getTime() + estimatedFlightDuration);

      console.log('Inserting flight data:', {
        flight_number: tripData.flight_number,
        departure_airport: tripData.origin,
        arrival_airport: tripData.destination,
        scheduled_departure: scheduledDeparture.toISOString(),
        scheduled_arrival: scheduledArrival.toISOString(),
      });

      const { data: flightData, error: flightError } = await supabase
        .from('flight_data')
        .insert({
          flight_number: tripData.flight_number,
          departure_airport: tripData.origin,
          arrival_airport: tripData.destination,
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
          title: "Viaje creado",
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
        title: "Viaje creado",
        description: "El viaje se creó pero no se pudo configurar el monitoreo del vuelo",
        variant: "destructive"
      });
    }
  };

  return { createFlightData };
}
