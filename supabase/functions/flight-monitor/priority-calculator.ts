
import { FlightRecord, FlightWithPriority } from './types.ts';

export async function calculateFlightPriorities(
  supabaseClient: any, 
  flights: FlightRecord[]
): Promise<FlightWithPriority[]> {
  const flightsWithPriority: FlightWithPriority[] = [];
  
  for (const flight of flights) {
    // Contar paquetes para este vuelo
    const { data: packages } = await supabaseClient
      .from('packages')
      .select('id', { count: 'exact' })
      .eq('flight_number', flight.flight_number);
    
    const packageCount = packages?.length || 0;
    const priority = Math.min(5, Math.max(1, Math.floor(packageCount / 2) + 1));
    
    flightsWithPriority.push({
      ...flight,
      packageCount,
      priority
    });
  }
  
  return flightsWithPriority;
}
