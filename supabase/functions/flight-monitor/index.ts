
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

    console.log('=== INICIO MONITOREO INTELIGENTE DE VUELOS ===')
    console.log('SUPABASE_URL:', Deno.env.get('SUPABASE_URL'))
    console.log('SERVICE_ROLE_KEY disponible:', !!Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'))
    console.log('AVIATIONSTACK_API_KEY disponible:', !!Deno.env.get('AVIATIONSTACK_API_KEY'))

    // Obtener vuelos que necesitan ser monitoreados con prioridad
    console.log('Consultando vuelos para monitorear con sistema de prioridad...')
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

    // Obtener todos los viajes y paquetes para calcular prioridades
    const { data: trips, error: tripsError } = await supabaseClient
      .from('trips')
      .select('*')

    if (tripsError) {
      console.error('Error obteniendo viajes:', tripsError)
      throw tripsError
    }

    // Calcular prioridades y ordenar vuelos
    const flightsWithPriority = await calculateFlightPriorities(supabaseClient, flights || [])
    const sortedFlights = flightsWithPriority.sort((a, b) => b.priority - a.priority)

    console.log('Vuelos ordenados por prioridad:', sortedFlights.map(f => ({
      flight: f.flight_number,
      priority: f.priority,
      packages: f.packageCount
    })))

    const updatedFlights = []
    let totalFlightsInDb = flights?.length || 0

    if (sortedFlights.length > 0) {
      for (const flight of sortedFlights) {
        try {
          console.log(`--- Verificando vuelo: ${flight.flight_number} (Prioridad: ${flight.priority}) ---`)
          
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
            trip_date: matchingTrip.trip_date,
            priority: flight.priority
          })
          
          // Verificar el estado del vuelo usando la estrategia inteligente
          const flightStatus = await checkFlightStatusIntelligent(supabaseClient, flight, matchingTrip.trip_date)
          console.log(`Estado obtenido para vuelo ${flight.flight_number}:`, flightStatus)
          
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
          // En caso de error, usar fallback basado en fecha
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

    // Mostrar estadísticas de uso de API
    const dailyUsage = await getDailyApiUsage(supabaseClient)
    console.log(`📊 Uso de API hoy: ${dailyUsage}/4 consultas`)

    const result = { 
      success: true, 
      monitored: flights?.length || 0,
      updated: updatedFlights.length,
      updatedFlights,
      totalFlightsInDb,
      dailyApiUsage: dailyUsage,
      maxDailyQueries: 4
    }

    console.log('=== FIN MONITOREO INTELIGENTE DE VUELOS ===')
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

// Función para calcular prioridades de vuelos
async function calculateFlightPriorities(supabaseClient: any, flights: any[]) {
  const flightsWithPriority = []
  
  for (const flight of flights) {
    // Contar paquetes para este vuelo
    const { data: packages } = await supabaseClient
      .from('packages')
      .select('id', { count: 'exact' })
      .eq('flight_number', flight.flight_number)
    
    const packageCount = packages?.length || 0
    const priority = Math.min(5, Math.max(1, Math.floor(packageCount / 2) + 1))
    
    flightsWithPriority.push({
      ...flight,
      packageCount,
      priority
    })
  }
  
  return flightsWithPriority
}

// Función para verificar el estado usando la estrategia inteligente
async function checkFlightStatusIntelligent(supabaseClient: any, flight: any, tripDate: string) {
  try {
    // Llamar a la función get-flight-data con la estrategia inteligente
    const response = await supabaseClient.functions.invoke('get-flight-data', {
      body: { 
        flightNumber: flight.flight_number, 
        tripDate: tripDate,
        priority: flight.priority || 1
      }
    })

    if (response.error) {
      console.log('Error en consulta inteligente, usando fallback de fecha')
      return await checkFlightStatusBasedOnDate(flight, tripDate)
    }

    const flightData = response.data
    if (!flightData) {
      return await checkFlightStatusBasedOnDate(flight, tripDate)
    }

    // Procesar respuesta de la estrategia inteligente
    const departure = flightData.departure
    const arrival = flightData.arrival

    let status = 'scheduled'
    let hasLanded = false
    let actualDeparture = departure?.actual || null
    let actualArrival = arrival?.actual || null

    switch (flightData.flight_status) {
      case 'landed':
      case 'arrived':
        status = 'arrived'
        hasLanded = true
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
      status,
      dataSource: flightData._fallback ? 'fallback_inteligente' : 'api'
    }

  } catch (error) {
    console.error('Error en estrategia inteligente:', error)
    return await checkFlightStatusBasedOnDate(flight, tripDate)
  }
}

// Función para obtener uso diario de API
async function getDailyApiUsage(supabaseClient: any) {
  const today = new Date().toISOString().split('T')[0]
  
  const { data, error } = await supabaseClient
    .from('flight_api_usage')
    .select('*', { count: 'exact' })
    .eq('query_date', today)
  
  return data?.length || 0
}

// Función fallback para verificar el estado de un vuelo basándose en la fecha
async function checkFlightStatusBasedOnDate(flight: any, tripDate: string) {
  console.log(`Verificando estado del vuelo con fallback de fecha: ${flight.flight_number} para fecha: ${tripDate}`)
  
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
      status: 'arrived',
      dataSource: 'fecha'
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
        status: 'arrived',
        dataSource: 'fecha'
      }
    }
  }
  
  // El vuelo aún no ha llegado
  return {
    hasLanded: false,
    actualDeparture: null,
    actualArrival: null,
    status: 'in_flight',
    dataSource: 'fecha'
  }
}
