
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { FlightData } from '@/types/flight';

export function useUpcomingFlights() {
  return useQuery({
    queryKey: ['upcoming-flights'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('flight_data')
        .select('*')
        .gte('scheduled_departure', today)
        .order('scheduled_departure', { ascending: true })
        .limit(2);
      
      if (error) throw error;
      return data as FlightData[];
    },
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes to avoid overloading
    staleTime: 3 * 60 * 1000, // Consider data stale after 3 minutes
  });
}
