
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { FlightData } from '@/types/flight';

interface TripWithFlight {
  id: string;
  trip_date: string;
  origin: string;
  destination: string;
  flight_number: string | null;
  status: string;
  created_at: string;
  flight_data?: FlightData | null;
}

export function useTripsWithFlights() {
  return useQuery({
    queryKey: ['trips-with-flights'],
    queryFn: async () => {
      // First get all trips
      const { data: trips, error: tripsError } = await supabase
        .from('trips')
        .select('*')
        .order('trip_date', { ascending: false });
      
      if (tripsError) throw tripsError;

      // Get flight data for trips that have flight numbers
      const tripsWithFlightNumbers = trips.filter(trip => trip.flight_number);
      
      if (tripsWithFlightNumbers.length === 0) {
        return trips.map(trip => ({ ...trip, flight_data: null }));
      }

      const flightNumbers = tripsWithFlightNumbers.map(trip => trip.flight_number);
      
      const { data: flightData, error: flightError } = await supabase
        .from('flight_data')
        .select('*')
        .in('flight_number', flightNumbers);
      
      if (flightError) throw flightError;

      // Combine trips with their flight data
      const tripsWithFlights = trips.map(trip => {
        const matchingFlight = trip.flight_number 
          ? flightData?.find(flight => flight.flight_number === trip.flight_number)
          : null;
        
        return {
          ...trip,
          flight_data: matchingFlight || null
        } as TripWithFlight;
      });

      return tripsWithFlights;
    },
    refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
    staleTime: 5 * 60 * 1000, // Consider data stale after 5 minutes
  });
}
