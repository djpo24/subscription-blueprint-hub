
import { supabase } from '@/integrations/supabase/client';
import { TripFormData, TripData } from '@/types/tripForm';
import { format } from 'date-fns';

export const prepareTripData = (formData: TripFormData, date: Date): TripData => {
  const routeParts = formData.route.split(' -> ');
  const [origin, destination] = routeParts;
  
  return {
    trip_date: format(date, 'yyyy-MM-dd'),
    origin,
    destination,
    flight_number: formData.flight_number || null,
    traveler_id: formData.traveler_id || null,
    status: 'scheduled'
  };
};

export const createTrip = async (tripData: TripData) => {
  // Check if a trip with the same flight number already exists for the same date
  if (tripData.flight_number) {
    const { data: existingTrip } = await supabase
      .from('trips')
      .select('id')
      .eq('flight_number', tripData.flight_number)
      .eq('trip_date', tripData.trip_date)
      .maybeSingle();

    if (existingTrip) {
      throw new Error('FLIGHT_EXISTS');
    }
  }

  const { data, error } = await supabase
    .from('trips')
    .insert(tripData)
    .select()
    .single();

  if (error) throw error;
  return data;
};
