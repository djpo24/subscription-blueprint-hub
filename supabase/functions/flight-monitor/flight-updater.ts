
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
      actual_arrival: flight.actual_arrival,
      actual_departure: flight.actual_departure,
      airline: flight.airline
    });
    
    // Si el vuelo ya aterrizó y fue notificado, no hacer nada
    if (flight.has_landed && flight.notification_sent) {
      console.log(`✅ Vuelo ${flight.flight_number} ya está procesado completamente`);
      return null;
    }
    
    console.log('Datos del vuelo y viaje:', {
      flight_number: flight.flight_number,
      scheduled_departure: flight.scheduled_departure,
      scheduled_arrival: flight.scheduled_arrival,
      trip_date: matchingTrip.trip_date,
      priority: flight.priority
    });
    
    // Verificar el estado del vuelo usando la estrategia inteligente
    const flightStatus = await checkFlightStatusIntelligent(supabaseClient, flight, matchingTrip.trip_date);
    console.log(`📊 Estado obtenido para vuelo ${flight.flight_number}:`, flightStatus);
    
    let wasUpdated = false;
    let updateData: any = {};
    
    // Preparar datos de actualización
    if (flightStatus.actualDeparture && flightStatus.actualDeparture !== flight.actual_departure) {
      updateData.actual_departure = flightStatus.actualDeparture;
      console.log(`🛫 Actualizando salida real: ${flightStatus.actualDeparture}`);
    }
    
    if (flightStatus.actualArrival && flightStatus.actualArrival !== flight.actual_arrival) {
      updateData.actual_arrival = flightStatus.actualArrival;
      console.log(`🛬 Actualizando llegada real: ${flightStatus.actualArrival}`);
    }
    
    if (flightStatus.status !== flight.status) {
      updateData.status = flightStatus.status;
      console.log(`📊 Actualizando estado: ${flight.status} → ${flightStatus.status}`);
    }
    
    if (flightStatus.hasLanded !== flight.has_landed) {
      updateData.has_landed = flightStatus.hasLanded;
      console.log(`✈️ Actualizando estado de aterrizaje: ${flight.has_landed} → ${flightStatus.hasLanded}`);
    }
    
    // Actualizar aerolínea si viene de la API
    if ((flightStatus as any).airline && (flightStatus as any).airline !== flight.airline) {
      updateData.airline = (flightStatus as any).airline;
      console.log(`🏢 Actualizando aerolínea: ${flight.airline} → ${(flightStatus as any).airline}`);
    }
    
    // Si hay datos para actualizar, hacer la actualización
    if (Object.keys(updateData).length > 0) {
      updateData.last_updated = new Date().toISOString();
      
      console.log(`💾 Actualizando vuelo ${flight.flight_number} con datos:`, updateData);
      
      const { error: updateError } = await supabaseClient
        .from('flight_data')
        .update(updateData)
        .eq('id', flight.id);

      if (updateError) {
        console.error('❌ Error actualizando vuelo:', updateError);
        return null;
      } else {
        console.log(`✅ Vuelo ${flight.flight_number} actualizado exitosamente`);
        
        // Log específico si el vuelo aterrizó
        if (flightStatus.hasLanded && !flight.has_landed) {
          console.log(`🎉 VUELO ATERRIZADO: ${flight.flight_number} - Datos de fuente: ${flightStatus.dataSource}`);
        }
        
        wasUpdated = true;
      }
    } else {
      console.log(`ℹ️ Vuelo ${flight.flight_number} no necesita actualización`);
    }
    
    return wasUpdated ? flight.flight_number : null;
    
  } catch (error) {
    console.error(`💥 Error monitoreando vuelo ${flight.flight_number}:`, error);
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
