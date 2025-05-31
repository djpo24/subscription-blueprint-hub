
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { TripFormData, TripData } from '@/types/tripForm';

export const validateRouteFormat = (route: string): { isValid: boolean; origin?: string; destination?: string; error?: string } => {
  if (!route.includes(' -> ')) {
    return { isValid: false, error: "Por favor selecciona una ruta válida" };
  }

  const routeParts = route.split(' -> ');
  if (routeParts.length !== 2 || !routeParts[0] || !routeParts[1]) {
    return { isValid: false, error: "Formato de ruta inválido" };
  }

  return { 
    isValid: true, 
    origin: routeParts[0].trim(), 
    destination: routeParts[1].trim() 
  };
};

export const prepareTripData = (formData: TripFormData, date: Date): TripData => {
  const validation = validateRouteFormat(formData.route);
  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  const tripDate = format(date, 'yyyy-MM-dd');
  
  return {
    trip_date: tripDate,
    origin: validation.origin!,
    destination: validation.destination!,
    flight_number: formData.flight_number.trim() || null,
    status: 'scheduled'
  };
};

export const checkExistingFlightTrip = async (tripDate: string, flightNumber: string) => {
  const { data: existingFlightTrip, error: flightCheckError } = await supabase
    .from('trips')
    .select('id, origin, destination')
    .eq('trip_date', tripDate)
    .eq('flight_number', flightNumber)
    .maybeSingle();

  if (flightCheckError) {
    console.error('Error checking existing flight trip:', flightCheckError);
    throw flightCheckError;
  }

  return existingFlightTrip;
};

export const createTrip = async (tripData: TripData) => {
  console.log('Creating trip with data:', tripData);
  
  // Verificar si ya existe un viaje con el mismo número de vuelo en la misma fecha
  if (tripData.flight_number) {
    const existingFlightTrip = await checkExistingFlightTrip(tripData.trip_date, tripData.flight_number);
    
    if (existingFlightTrip) {
      throw new Error('FLIGHT_EXISTS');
    }
  }

  // Crear el nuevo viaje sin verificar ruta duplicada
  const { data, error } = await supabase
    .from('trips')
    .insert([tripData])
    .select()
    .single();

  if (error) throw error;
  return data;
};
