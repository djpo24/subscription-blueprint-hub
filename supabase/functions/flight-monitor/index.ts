
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('=== INICIO MONITOREO DE VUELOS ===')
    console.log('SUPABASE_URL:', Deno.env.get('SUPABASE_URL'))
    console.log('SERVICE_ROLE_KEY disponible:', !!Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'))

    // Obtener vuelos que necesitan ser monitoreados
    console.log('Consultando vuelos para monitorear...')
    const { data: flights, error: flightsError } = await supabaseClient
      .from('flight_data')
      .select('*, trips!inner(trip_date)')
      .eq('has_landed', false)
      .not('flight_number', 'is', null)

    console.log('Vuelos encontrados para monitorear:', flights?.length || 0)

    if (flightsError) {
      console.error('Error obteniendo vuelos para monitorear:', flightsError)
      throw flightsError
    }

    const updatedFlights = []

    if (flights && flights.length > 0) {
      for (const flight of flights) {
        try {
          console.log(`--- Verificando vuelo: ${flight.flight_number} ---`)
          console.log('Datos del vuelo:', {
            flight_number: flight.flight_number,
            scheduled_departure: flight.scheduled_departure,
            scheduled_arrival: flight.scheduled_arrival,
            trips: flight.trips
          })
          
          // Verificar el estado del vuelo basándose en la fecha real
          const flightStatus = await checkFlightStatusBasedOnDate(flight, flight.trips[0]?.trip_date)
          console.log(`Estado calculado para vuelo ${flight.flight_number}:`, flightStatus)
          
          if (flightStatus.hasLanded && !flight.has_landed) {
            console.log(`✈️ Vuelo ${flight.flight_number} ha aterrizado - actualizando...`)
            
            // Actualizar estado del vuelo
            const { data: updatedFlight, error: updateError } = await supabaseClient
              .from('flight_data')
              .update({
                has_landed: true,
                actual_departure: flightStatus.actualDeparture,
                actual_arrival: flightStatus.actualArrival,
                status: 'arrived',
                last_updated: new Date().toISOString()
              })
              .eq('id', flight.id)
              .select()

            if (updateError) {
              console.error('Error actualizando vuelo:', updateError)
            } else {
              console.log(`✅ Vuelo ${flight.flight_number} marcado como aterrizado`)
              updatedFlights.push(flight.flight_number)
            }
          } else {
            console.log(`🛫 Vuelo ${flight.flight_number} estado actual: ${flightStatus.status}`)
          }
        } catch (error) {
          console.error(`Error monitoreando vuelo ${flight.flight_number}:`, error)
        }
      }
    } else {
      console.log('⚠️ No se encontraron vuelos para monitorear')
    }

    const result = { 
      success: true, 
      monitored: flights?.length || 0,
      updated: updatedFlights.length,
      updatedFlights
    }

    console.log('=== FIN MONITOREO DE VUELOS ===')
    console.log('Resultado final:', result)

    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('💥 Error crítico en flight-monitor:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.toString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})

// Función para verificar el estado de un vuelo basándose en la fecha real
async function checkFlightStatusBasedOnDate(flight: any, tripDate: string) {
  console.log(`Verificando estado del vuelo: ${flight.flight_number} para fecha: ${tripDate}`)
  
  const now = new Date()
  const flightDate = new Date(tripDate)
  const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const flightDateOnly = new Date(flightDate.getFullYear(), flightDate.getMonth(), flightDate.getDate())
  
  console.log('Comparación de fechas:', {
    flightDate: flightDateOnly.toISOString(),
    todayDate: todayDate.toISOString(),
    isFlightBeforeToday: flightDateOnly < todayDate,
    isFlightToday: flightDateOnly.getTime() === todayDate.getTime()
  })

  // Si la fecha del vuelo es anterior a hoy, definitivamente ya aterrizó
  if (flightDateOnly < todayDate) {
    const scheduledDeparture = new Date(flight.scheduled_departure)
    const scheduledArrival = new Date(flight.scheduled_arrival)
    
    return {
      hasLanded: true,
      actualDeparture: scheduledDeparture.toISOString(),
      actualArrival: scheduledArrival.toISOString(),
      status: 'arrived'
    }
  }
  
  // Si es hoy, verificar la hora
  if (flightDateOnly.getTime() === todayDate.getTime()) {
    const scheduledArrival = new Date(flight.scheduled_arrival)
    const currentTime = now.getTime()
    
    if (currentTime >= scheduledArrival.getTime()) {
      return {
        hasLanded: true,
        actualDeparture: flight.scheduled_departure,
        actualArrival: scheduledArrival.toISOString(),
        status: 'arrived'
      }
    }
  }
  
  // El vuelo aún no ha llegado
  return {
    hasLanded: false,
    actualDeparture: null,
    actualArrival: null,
    status: 'in_flight'
  }
}
