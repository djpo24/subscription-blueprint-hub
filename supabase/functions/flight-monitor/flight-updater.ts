
import { FlightRecord, TripRecord, FlightWithPriority } from './types.ts';
import { checkFlightStatusIntelligent, checkFlightStatusBasedOnDate } from './flight-status-checker.ts';

export async function updateFlightStatus(
  supabaseClient: any,
  flight: FlightWithPriority,
  matchingTrip: TripRecord
): Promise<string | null> {
  try {
    console.log(`--- Verificando vuelo: ${flight.flight_number} (Prioridad: ${flight.priority}) ---`);
    
    console.log('Datos del vuelo:', {
      flight_number: flight.flight_number,
      scheduled_departure: flight.scheduled_departure,
      scheduled_arrival: flight.scheduled_arrival,
      trip_date: matchingTrip.trip_date,
      priority: flight.priority
    });
    
    // Verificar el estado del vuelo usando la estrategia inteligente
    const flightStatus = await checkFlightStatusIntelligent(supabaseClient, flight, matchingTrip.trip_date);
    console.log(`Estado obtenido para vuelo ${flight.flight_number}:`, flightStatus);
    
    if (flightStatus.hasLanded && !flight.has_landed) {
      console.log(`✈️ Vuelo ${flight.flight_number} ha aterrizado - actualizando...`);
      
      // Actualizar estado del vuelo
      const { data: updatedFlight, error: updateError } = await supabaseClient
        .from('flight_data')
        .update({
          has_landed: true,
          actual_departure: flightStatus.actualDeparture,
          actual_arrival: flightStatus.actualArrival,
          status: flightStatus.status,
          last_updated: new Date().toISOString()
        })
        .eq('id', flight.id)
        .select();

      if (updateError) {
        console.error('Error actualizando vuelo:', updateError);
        return null;
      } else {
        console.log(`✅ Vuelo ${flight.flight_number} marcado como aterrizado`);
        return flight.flight_number;
      }
    } else {
      console.log(`🛫 Vuelo ${flight.flight_number} estado actual: ${flightStatus.status}`);
      
      // Actualizar información del vuelo aunque no haya aterrizado
      if (flightStatus.actualDeparture || flightStatus.status !== flight.status) {
        await supabaseClient
          .from('flight_data')
          .update({
            actual_departure: flightStatus.actualDeparture,
            status: flightStatus.status,
            last_updated: new Date().toISOString()
          })
          .eq('id', flight.id);
        
        console.log(`📝 Información actualizada para vuelo ${flight.flight_number}`);
      }
      return null;
    }
  } catch (error) {
    console.error(`Error monitoreando vuelo ${flight.flight_number}:`, error);
    // En caso de error, usar fallback basado en fecha
    const fallbackStatus = await checkFlightStatusBasedOnDate(flight, matchingTrip.trip_date);
    
    if (fallbackStatus.hasLanded && !flight.has_landed) {
      console.log(`⚠️ Usando fallback para vuelo ${flight.flight_number}`);
      await supabaseClient
        .from('flight_data')
        .update({
          has_landed: true,
          actual_departure: fallbackStatus.actualDeparture,
          actual_arrival: fallbackStatus.actualArrival,
          status: fallbackStatus.status,
          last_updated: new Date().toISOString()
        })
        .eq('id', flight.id);
      
      return flight.flight_number;
    }
    return null;
  }
}
