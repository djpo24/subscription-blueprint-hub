
import { FlightRecord, TripRecord, FlightWithPriority } from './types.ts';
import { checkFlightStatusIntelligent, checkFlightStatusBasedOnDate } from './flight-status-checker.ts';

export async function updateFlightStatus(
  supabaseClient: any,
  flight: FlightWithPriority,
  matchingTrip: TripRecord
): Promise<string | null> {
  try {
    console.log(`--- Verificando vuelo: ${flight.flight_number} (Prioridad: ${flight.priority}) ---`);
    
    console.log('Estado actual del vuelo en BD:', {
      flight_number: flight.flight_number,
      has_landed: flight.has_landed,
      notification_sent: flight.notification_sent,
      status: flight.status,
      actual_arrival: flight.actual_arrival
    });
    
    // Si el vuelo ya aterrizó y fue notificado, no hacer nada
    if (flight.has_landed && flight.notification_sent) {
      console.log(`✅ Vuelo ${flight.flight_number} ya está procesado completamente`);
      return null;
    }
    
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
    
    let wasUpdated = false;
    
    // Si el vuelo ha aterrizado pero no estaba marcado como tal
    if (flightStatus.hasLanded && !flight.has_landed) {
      console.log(`✈️ Vuelo ${flight.flight_number} ha aterrizado - actualizando...`);
      
      // Actualizar estado del vuelo
      const { error: updateError } = await supabaseClient
        .from('flight_data')
        .update({
          has_landed: true,
          actual_departure: flightStatus.actualDeparture,
          actual_arrival: flightStatus.actualArrival,
          status: flightStatus.status,
          last_updated: new Date().toISOString()
        })
        .eq('id', flight.id);

      if (updateError) {
        console.error('Error actualizando vuelo:', updateError);
        return null;
      } else {
        console.log(`✅ Vuelo ${flight.flight_number} marcado como aterrizado`);
        wasUpdated = true;
      }
    } 
    // Si el vuelo ya aterrizado pero necesita actualizar datos
    else if (flightStatus.hasLanded && flight.has_landed) {
      console.log(`🔄 Vuelo ${flight.flight_number} ya aterrizado, verificando si necesita actualización de datos`);
      
      let needsUpdate = false;
      const updates: any = {};
      
      // Verificar si necesita actualizar horarios reales
      if (flightStatus.actualDeparture && flightStatus.actualDeparture !== flight.actual_departure) {
        updates.actual_departure = flightStatus.actualDeparture;
        needsUpdate = true;
      }
      
      if (flightStatus.actualArrival && flightStatus.actualArrival !== flight.actual_arrival) {
        updates.actual_arrival = flightStatus.actualArrival;
        needsUpdate = true;
      }
      
      if (flightStatus.status !== flight.status) {
        updates.status = flightStatus.status;
        needsUpdate = true;
      }
      
      if (needsUpdate) {
        updates.last_updated = new Date().toISOString();
        
        await supabaseClient
          .from('flight_data')
          .update(updates)
          .eq('id', flight.id);
        
        console.log(`📝 Datos actualizados para vuelo ${flight.flight_number}:`, updates);
        wasUpdated = true;
      } else {
        console.log(`ℹ️ Vuelo ${flight.flight_number} ya tiene los datos más recientes`);
      }
    } 
    // Vuelo en proceso - actualizar información
    else {
      console.log(`🛫 Vuelo ${flight.flight_number} estado actual: ${flightStatus.status}`);
      
      // Actualizar información del vuelo aunque no haya aterrizado
      if (flightStatus.actualDeparture || flightStatus.status !== flight.status) {
        const updates: any = {
          status: flightStatus.status,
          last_updated: new Date().toISOString()
        };
        
        if (flightStatus.actualDeparture) {
          updates.actual_departure = flightStatus.actualDeparture;
        }
        
        await supabaseClient
          .from('flight_data')
          .update(updates)
          .eq('id', flight.id);
        
        console.log(`📝 Información actualizada para vuelo ${flight.flight_number}`);
        wasUpdated = true;
      }
    }
    
    return wasUpdated ? flight.flight_number : null;
    
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
