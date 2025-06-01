
import { supabase } from '@/integrations/supabase/client';
import { FlightData } from '@/types/flight';

export interface FlightApiResponse {
  departure?: {
    scheduled?: string;
    actual?: string;
  };
  arrival?: {
    scheduled?: string;
    actual?: string;
  };
  flight_status?: string;
  api_departure_airport?: string;
  api_arrival_airport?: string;
  api_departure_city?: string;
  api_arrival_city?: string;
  api_departure_gate?: string;
  api_arrival_gate?: string;
  api_departure_terminal?: string;
  api_arrival_terminal?: string;
  api_aircraft?: string;
  api_flight_status?: string;
  api_departure_timezone?: string;
  api_arrival_timezone?: string;
  api_departure_iata?: string;
  api_arrival_iata?: string;
  api_departure_icao?: string;
  api_arrival_icao?: string;
  api_airline_name?: string;
  api_airline_iata?: string;
  api_airline_icao?: string;
  api_aircraft_registration?: string;
  api_aircraft_iata?: string;
  api_raw_data?: any;
  _fallback?: boolean;
}

export async function checkExistingFlight(flightNumber: string): Promise<FlightData | null> {
  const { data: existingFlight } = await supabase
    .from('flight_data')
    .select('*')
    .eq('flight_number', flightNumber)
    .single();

  return existingFlight as FlightData | null;
}

export async function calculateFlightPriority(flightNumber: string): Promise<number> {
  const { data: packageCount } = await supabase
    .from('packages')
    .select('id', { count: 'exact' })
    .eq('flight_number', flightNumber);
  
  const priority = Math.min(5, Math.max(1, Math.floor((packageCount?.length || 0) / 2) + 1));
  console.log(`Prioridad calculada para vuelo ${flightNumber}: ${priority} (basada en ${packageCount?.length || 0} paquetes)`);
  
  return priority;
}

export async function fetchFlightDataFromAPI(
  flightNumber: string, 
  tripDate: string, 
  priority: number
): Promise<FlightApiResponse | null> {
  try {
    console.log('🎯 MONITOREO MANUAL: Iniciando captura COMPLETA de datos de la API...');
    const response = await supabase.functions.invoke('get-flight-data', {
      body: { flightNumber, tripDate, priority }
    });

    if (response.data && !response.error) {
      const flightData = response.data;
      console.log('🎯 MONITOREO MANUAL: Datos COMPLETOS capturados de la API:', {
        source: flightData._fallback ? 'fallback' : 'api',
        flight_status: flightData.flight_status,
        // Información de aeropuertos y ciudades
        api_departure_city: flightData.api_departure_city,
        api_arrival_city: flightData.api_arrival_city,
        api_departure_airport: flightData.api_departure_airport,
        api_arrival_airport: flightData.api_arrival_airport,
        // Información de terminales y puertas
        api_departure_gate: flightData.api_departure_gate,
        api_arrival_gate: flightData.api_arrival_gate,
        api_departure_terminal: flightData.api_departure_terminal,
        api_arrival_terminal: flightData.api_arrival_terminal,
        // Información de aeronave y aerolínea
        api_aircraft: flightData.api_aircraft,
        api_airline_name: flightData.api_airline_name,
        api_aircraft_registration: flightData.api_aircraft_registration,
        // Códigos IATA/ICAO
        api_departure_iata: flightData.api_departure_iata,
        api_arrival_iata: flightData.api_arrival_iata,
        api_departure_icao: flightData.api_departure_icao,
        api_arrival_icao: flightData.api_arrival_icao,
        api_airline_iata: flightData.api_airline_iata,
        api_airline_icao: flightData.api_airline_icao,
        // Horarios exactos
        departure_scheduled: flightData.departure?.scheduled,
        departure_actual: flightData.departure?.actual,
        arrival_scheduled: flightData.arrival?.scheduled,
        arrival_actual: flightData.arrival?.actual,
        // Zonas horarias
        api_departure_timezone: flightData.api_departure_timezone,
        api_arrival_timezone: flightData.api_arrival_timezone,
        // Datos completos en bruto
        api_raw_data_available: !!flightData.api_raw_data
      });
      
      console.log('✅ MONITOREO MANUAL: Todos los datos de la API han sido capturados exitosamente');
      return flightData;
    }
  } catch (error) {
    console.log('❌ MONITOREO MANUAL: Error en captura de datos, usando valores por defecto:', error);
  }
  
  return null;
}
