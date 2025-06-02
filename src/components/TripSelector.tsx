
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface TripSelectorProps {
  selectedTripId: string;
  onTripChange: (tripId: string) => void;
  disabled?: boolean;
  readOnly?: boolean;
}

export function TripSelector({ selectedTripId, onTripChange, disabled, readOnly }: TripSelectorProps) {
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
    enabled: !disabled && !readOnly
  });

  // Fetch specific trip data when in readOnly mode
  const { data: selectedTrip } = useQuery({
    queryKey: ['trip-details', selectedTripId],
    queryFn: async () => {
      if (!selectedTripId) return null;
      
      const { data, error } = await supabase
        .from('trips')
        .select('id, trip_date, origin, destination, flight_number')
        .eq('id', selectedTripId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: readOnly && !!selectedTripId
  });

  if (disabled) {
    return null;
  }

  // Display read-only version with trip date
  if (readOnly && selectedTrip) {
    return (
      <div>
        <Label htmlFor="trip">Viaje</Label>
        <div className="h-10 w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-sm text-gray-600 cursor-not-allowed">
          {new Date(selectedTrip.trip_date).toLocaleDateString()} - {selectedTrip.origin} → {selectedTrip.destination}
          {selectedTrip.flight_number && ` (${selectedTrip.flight_number})`}
        </div>
      </div>
    );
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
