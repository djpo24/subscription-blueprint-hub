
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface TripWithPackages {
  id: string;
  origin: string;
  destination: string;
  flight_number: string | null;
  status: string;
  packages: Array<{
    id: string;
    tracking_number: string;
    origin: string;
    destination: string;
    status: string;
    description: string;
    customers: {
      name: string;
      email: string;
    } | null;
  }>;
}

export function usePackagesByDate(date: Date) {
  return useQuery({
    queryKey: ['packages-by-date', format(date, 'yyyy-MM-dd')],
    queryFn: async (): Promise<TripWithPackages[]> => {
      const formattedDate = format(date, 'yyyy-MM-dd');
      
      // Primero obtenemos todos los viajes del día
      const { data: trips, error: tripsError } = await supabase
        .from('trips')
        .select('*')
        .eq('trip_date', formattedDate)
        .order('created_at', { ascending: false });
      
      if (tripsError) throw tripsError;
      
      if (!trips || trips.length === 0) {
        return [];
      }
      
      // Para cada viaje, obtenemos sus encomiendas
      const tripsWithPackages: TripWithPackages[] = [];
      
      for (const trip of trips) {
        const { data: packages, error: packagesError } = await supabase
          .from('packages')
          .select(`
            id,
            tracking_number,
            origin,
            destination,
            status,
            description,
            customers (
              name,
              email
            )
          `)
          .eq('trip_id', trip.id)
          .order('created_at', { ascending: false });
        
        if (packagesError) throw packagesError;
        
        tripsWithPackages.push({
          id: trip.id,
          origin: trip.origin,
          destination: trip.destination,
          flight_number: trip.flight_number,
          status: trip.status,
          packages: packages || []
        });
      }
      
      return tripsWithPackages;
    },
    enabled: !!date
  });
}
