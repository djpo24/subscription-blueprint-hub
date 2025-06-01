
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { FlightRecord, TripRecord, MonitoringResult } from './types.ts'
import { calculateFlightPriorities } from './priority-calculator.ts'
import { getDailyApiUsage } from './api-usage.ts'
import { updateFlightStatus } from './flight-updater.ts'

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

    // Obtener todos los viajes para calcular prioridades
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

    const updatedFlights: string[] = []
    let totalFlightsInDb = flights?.length || 0

    if (sortedFlights.length > 0) {
      for (const flight of sortedFlights) {
        // Encontrar el viaje correspondiente
        const matchingTrip = trips?.find(trip => trip.flight_number === flight.flight_number)
        
        if (!matchingTrip) {
          console.log(`No se encontró viaje para vuelo ${flight.flight_number}`)
          continue
        }

        const updatedFlightNumber = await updateFlightStatus(supabaseClient, flight, matchingTrip)
        if (updatedFlightNumber) {
          updatedFlights.push(updatedFlightNumber)
        }
      }
    } else {
      console.log('⚠️ No se encontraron vuelos para monitorear')
    }

    // Mostrar estadísticas de uso de API
    const dailyUsage = await getDailyApiUsage(supabaseClient)
    console.log(`📊 Uso de API hoy: ${dailyUsage}/4 consultas`)

    const result: MonitoringResult = { 
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
