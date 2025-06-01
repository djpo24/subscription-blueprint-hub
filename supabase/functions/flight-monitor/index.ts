
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
    console.log('AVIATIONSTACK_API_KEY disponible:', !!Deno.env.get('AVIATIONSTACK_API_KEY'))

    // Obtener vuelos que necesitan ser monitoreados
    console.log('Consultando vuelos para monitorear...')
    const { data: flights, error: flightsError } = await supabaseClient
      .from('flight_data')
      .select('*')
      .eq('has_landed', false)
      .not('flight_number', 'is', null)

    console.log('Vuelos encontrados para monitorear:', flights?.length || 0)

    if (flightsError) {
      console.error('Error obteniendo vuelos para monitorear:', flightsError)
      throw flightsError
    }

    // Obtener todos los viajes para hacer el matching manualmente
    const { data: trips, error: tripsError } = await supabaseClient
      .from('trips')
      .select('*')

    if (tripsError) {
      console.error('Error obteniendo viajes:', tripsError)
      throw tripsError
    }

    const updatedFlights = []
    let totalFlightsInDb = flights?.length || 0

    if (flights && flights.length > 0) {
      for (const flight of flights) {
        try {
          console.log(`--- Verificando vuelo: ${flight.flight_number} ---`)
          
          // Encontrar el viaje correspondiente
          const matchingTrip = trips?.find(trip => trip.flight_number === flight.flight_number)
          
          if (!matchingTrip) {
            console.log(`No se encontró viaje para vuelo ${flight.flight_number}`)
            continue
          }

          console.log('Datos del vuelo:', {
            flight_number: flight.flight_number,
            scheduled_departure: flight.scheduled_departure,
            scheduled_arrival: flight.scheduled_arrival,
            trip_date: matchingTrip.trip_date
          })
          
          // Verificar el estado del vuelo usando la API de AviationStack
          const flightStatus = await checkFlightStatusWithAPI(flight, matchingTrip.trip_date)
          console.log(`Estado obtenido de API para vuelo ${flight.flight_number}:`, flightStatus)
          
          if (flightStatus.hasLanded && !flight.has_landed) {
            console.log(`✈️ Vuelo ${flight.flight_number} ha aterrizado - actualizando...`)
            
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
              .select()

            if (updateError) {
              console.error('Error actualizando vuelo:', updateError)
            } else {
              console.log(`✅ Vuelo ${flight.flight_number} marcado como aterrizado`)
              updatedFlights.push(flight.flight_number)
            }
          } else {
            console.log(`🛫 Vuelo ${flight.flight_number} estado actual: ${flightStatus.status}`)
            
            // Actualizar información del vuelo aunque no haya aterrizado
            if (flightStatus.actualDeparture || flightStatus.status !== flight.status) {
              await supabaseClient
                .from('flight_data')
                .update({
                  actual_departure: flightStatus.actualDeparture,
                  status: flightStatus.status,
                  last_updated: new Date().toISOString()
                })
                .eq('id', flight.id)
              
              console.log(`📝 Información actualizada para vuelo ${flight.flight_number}`)
            }
          }
        } catch (error) {
          console.error(`Error monitoreando vuelo ${flight.flight_number}:`, error)
          // En caso de error con la API, usar fallback basado en fecha
          const fallbackStatus = await checkFlightStatusBasedOnDate(flight, matchingTrip.trip_date)
          
          if (fallbackStatus.hasLanded && !flight.has_landed) {
            console.log(`⚠️ Usando fallback para vuelo ${flight.flight_number}`)
            await supabaseClient
              .from('flight_data')
              .update({
                has_landed: true,
                actual_departure: fallbackStatus.actualDeparture,
                actual_arrival: fallbackStatus.actualArrival,
                status: fallbackStatus.status,
                last_updated: new Date().toISOString()
              })
              .eq('id', flight.id)
            
            updatedFlights.push(flight.flight_number)
          }
        }
      }
    } else {
      console.log('⚠️ No se encontraron vuelos para monitorear')
    }

    const result = { 
      success: true, 
      monitored: flights?.length || 0,
      updated: updatedFlights.length,
      updatedFlights,
      totalFlightsInDb
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

// Función para verificar el estado de un vuelo usando la API de AviationStack
async function checkFlightStatusWithAPI(flight: any, tripDate: string) {
  const apiKey = Deno.env.get('AVIATIONSTACK_API_KEY')
  
  if (!apiKey) {
    console.log('API key no disponible, usando fallback')
    return await checkFlightStatusBasedOnDate(flight, tripDate)
  }

  try {
    console.log(`Consultando API para vuelo: ${flight.flight_number}`)
    
    // Construir URL de la API de AviationStack
    const apiUrl = `http://api.aviationstack.com/v1/flights?access_key=${apiKey}&flight_iata=${flight.flight_number}&limit=1`
    
    const response = await fetch(apiUrl)
    const data = await response.json()

    console.log('Respuesta de AviationStack API:', {
      data: data?.data?.length || 0,
      error: data?.error || null
    })

    if (data.error) {
      console.error('Error de API de AviationStack:', data.error)
      return await checkFlightStatusBasedOnDate(flight, tripDate)
    }

    if (!data.data || data.data.length === 0) {
      console.log('No se encontraron datos para el vuelo en la API')
      return await checkFlightStatusBasedOnDate(flight, tripDate)
    }

    const flightData = data.data[0]
    const departure = flightData.departure
    const arrival = flightData.arrival

    console.log('Datos del vuelo desde API:', {
      flight_status: flightData.flight_status,
      departure_scheduled: departure?.scheduled,
      departure_actual: departure?.actual,
      arrival_scheduled: arrival?.scheduled,
      arrival_actual: arrival?.actual
    })

    // Determinar el estado basándose en los datos de la API
    let status = 'scheduled'
    let hasLanded = false
    let actualDeparture = departure?.actual || null
    let actualArrival = arrival?.actual || null

    switch (flightData.flight_status) {
      case 'landed':
      case 'arrived':
        status = 'arrived'
        hasLanded = true
        // Si no hay hora real de llegada pero el estado es landed, usar la programada
        if (!actualArrival && arrival?.scheduled) {
          actualArrival = arrival.scheduled
        }
        break
      case 'active':
      case 'en-route':
        status = 'in_flight'
        break
      case 'cancelled':
        status = 'cancelled'
        break
      case 'delayed':
        status = 'delayed'
        break
      default:
        // Para otros estados, verificar basándose en las fechas
        if (actualArrival) {
          status = 'arrived'
          hasLanded = true
        } else if (actualDeparture) {
          status = 'in_flight'
        }
    }

    return {
      hasLanded,
      actualDeparture,
      actualArrival,
      status
    }

  } catch (error) {
    console.error('Error consultando API de AviationStack:', error)
    // En caso de error, usar el método basado en fecha como fallback
    return await checkFlightStatusBasedOnDate(flight, tripDate)
  }
}

// Función fallback para verificar el estado de un vuelo basándose en la fecha
async function checkFlightStatusBasedOnDate(flight: any, tripDate: string) {
  console.log(`Verificando estado del vuelo con fallback: ${flight.flight_number} para fecha: ${tripDate}`)
  
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
