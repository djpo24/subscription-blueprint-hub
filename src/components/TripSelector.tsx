
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface TripSelectorProps {
  selectedTripId: string;
  onTripChange: (tripId: string) => void;
  disabled?: boolean;
}

export function TripSelector({ selectedTripId, onTripChange, disabled }: TripSelectorProps) {
  // Fetch trips for the dropdown
  const { data: trips = [] } = useQuery({
    queryKey: ['trips-for-packages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('trips')
        .select('id, trip_date, origin, destination, flight_number')
        .eq('status', 'scheduled')
        .order('trip_date', { ascending: true });
      
      if (error) throw error;
      return data;
    },
    enabled: !disabled
  });

  if (disabled) {
    return null;
  }

  return (
    <div>
      <Label htmlFor="trip">Viaje</Label>
      <Select 
        value={selectedTripId} 
        onValueChange={onTripChange}
        required
      >
        <SelectTrigger>
          <SelectValue placeholder="Seleccionar viaje" />
        </SelectTrigger>
        <SelectContent>
          {trips.map((trip) => (
            <SelectItem key={trip.id} value={trip.id}>
              {new Date(trip.trip_date).toLocaleDateString()} - {trip.origin} → {trip.destination}
              {trip.flight_number && ` (${trip.flight_number})`}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
