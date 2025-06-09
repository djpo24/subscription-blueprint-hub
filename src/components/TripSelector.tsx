
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface TripSelectorProps {
  selectedTripId: string;
  onTripChange: (tripId: string) => void;
  disabled?: boolean;
  readOnly?: boolean;
}

export function TripSelector({ selectedTripId, onTripChange, disabled, readOnly }: TripSelectorProps) {
  // Fetch trips for the dropdown (only when not readOnly and not disabled)
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

  // Fetch specific trip data when we have a selectedTripId (always enabled when we have an ID)
  const { data: selectedTrip, isLoading: tripLoading } = useQuery({
    queryKey: ['trip-details', selectedTripId],
    queryFn: async () => {
      if (!selectedTripId) return null;
      
      console.log('🔍 [TripSelector] Buscando detalles del viaje:', selectedTripId);
      const { data, error } = await supabase
        .from('trips')
        .select('id, trip_date, origin, destination, flight_number')
        .eq('id', selectedTripId)
        .maybeSingle();
      
      if (error) {
        console.error('❌ [TripSelector] Error al buscar viaje:', error);
        throw error;
      }
      
      console.log('✅ [TripSelector] Viaje encontrado:', data);
      return data;
    },
    enabled: !!selectedTripId // Always enabled when we have an ID
  });

  if (disabled) {
    return null;
  }

  // Format date safely avoiding timezone issues
  const formatTripDate = (dateString: string) => {
    try {
      // Parse the date string directly (assumes YYYY-MM-DD format from database)
      const dateParts = dateString.split('-');
      const year = parseInt(dateParts[0]);
      const month = parseInt(dateParts[1]) - 1; // Month is 0-indexed
      const day = parseInt(dateParts[2]);
      
      const date = new Date(year, month, day);
      return format(date, 'dd/MM/yyyy');
    } catch (error) {
      console.error('❌ [TripSelector] Error formatting date:', error);
      return dateString;
    }
  };

  // Display read-only version
  if (readOnly) {
    if (tripLoading) {
      return (
        <div>
          <Label htmlFor="trip">Viaje</Label>
          <div className="h-10 w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-sm text-gray-600 cursor-not-allowed">
            Cargando viaje...
          </div>
        </div>
      );
    }

    if (selectedTrip) {
      const formattedDate = formatTripDate(selectedTrip.trip_date);
      console.log('📅 [TripSelector] Fecha original:', selectedTrip.trip_date);
      console.log('📅 [TripSelector] Fecha formateada:', formattedDate);
      
      return (
        <div>
          <Label htmlFor="trip">Viaje</Label>
          <div className="h-10 w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-sm text-gray-600 cursor-not-allowed">
            {formattedDate} - {selectedTrip.origin} → {selectedTrip.destination}
            {selectedTrip.flight_number && ` (${selectedTrip.flight_number})`}
          </div>
        </div>
      );
    } else if (selectedTripId) {
      // We have an ID but couldn't find the trip
      return (
        <div>
          <Label htmlFor="trip">Viaje</Label>
          <div className="h-10 w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-sm text-gray-600 cursor-not-allowed">
            Viaje no encontrado
          </div>
        </div>
      );
    } else {
      // No trip selected
      return (
        <div>
          <Label htmlFor="trip">Viaje</Label>
          <div className="h-10 w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-sm text-gray-600 cursor-not-allowed">
            Sin viaje asignado
          </div>
        </div>
      );
    }
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
          {trips.map((trip) => {
            const formattedDate = formatTripDate(trip.trip_date);
            return (
              <SelectItem key={trip.id} value={trip.id}>
                {formattedDate} - {trip.origin} → {trip.destination}
                {trip.flight_number && ` (${trip.flight_number})`}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}
