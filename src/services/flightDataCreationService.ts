
import { supabase } from '@/integrations/supabase/client';
import { FlightData } from '@/types/flight';
import { 
  checkExistingFlight, 
  calculateFlightPriority, 
  fetchFlightDataFromAPI 
} from '@/services/flightDataService';
import { calculateFlightStatus } from '@/utils/flightStatusCalculator';
import { mapFlightDataForDatabase } from '@/utils/flightDataMapper';

export interface CreateFlightDataParams {
  tripDate: string;
  flightNumber: string;
  origin: string;
  destination: string;
}

export async function createFlightDataService({
  tripDate,
  flightNumber,
  origin,
  destination
}: CreateFlightDataParams): Promise<FlightData> {
  console.log('Creating flight data for:', { tripDate, flightNumber, origin, destination });
  
  // Verificar si ya existe un vuelo con este número
  const existingFlight = await checkExistingFlight(flightNumber);
  if (existingFlight) {
    console.log('Flight already exists:', existingFlight);
    return existingFlight;
  }

  // Calcular prioridad basada en número de paquetes
  const priority = await calculateFlightPriority(flightNumber);

  // Intentar obtener datos reales del vuelo desde la API con estrategia inteligente
  const flightDataFromAPI = await fetchFlightDataFromAPI(flightNumber, tripDate, priority);

  // Calcular el estado del vuelo
  const flightStatusResult = calculateFlightStatus(tripDate, flightDataFromAPI);

  // Mapear datos para la base de datos
  const flightData = mapFlightDataForDatabase(
    flightNumber,
    origin,
    destination,
    flightStatusResult,
    flightDataFromAPI
  );

  const { data, error } = await supabase
    .from('flight_data')
    .insert(flightData)
    .select()
    .single();

  if (error) {
    console.error('Error creating flight data:', error);
    throw error;
  }

  console.log('🎯 Flight data created successfully with COMPLETE API data stored in DB:', data);
  return data as FlightData;
}
