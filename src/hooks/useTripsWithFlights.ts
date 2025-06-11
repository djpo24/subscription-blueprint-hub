
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface TripWithFlight {
  id: string;
  trip_date: string;
  origin: string;
  destination: string;
  flight_number: string | null;
  status: string;
  created_at: string;
  flight_data?: any | null;
}

export function useTripsWithFlights() {
  return useQuery({
    queryKey: ['trips-with-flights'],
    queryFn: async () => {
      // Get all trips - flight_data table doesn't exist, so we'll just return trips without flight data
      const { data: trips, error: tripsError } = await supabase
        .from('trips')
        .select('*')
        .order('trip_date', { ascending: false });
      
      if (tripsError) throw tripsError;

      // Since flight_data table doesn't exist, return trips with null flight_data
      const tripsWithFlights = (trips || []).map(trip => ({
        ...trip,
        flight_data: null
      } as TripWithFlight));

      return tripsWithFlights;
    },
    refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
    staleTime: 5 * 60 * 1000, // Consider data stale after 5 minutes
  });
}
