
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { checkCache, saveToCache } from './cache-service.ts'
import { getDailyApiUsage, recordApiUsage, hasReachedDailyLimit, MAX_DAILY_QUERIES } from './api-usage-service.ts'
import { checkPriorityQueue } from './priority-queue.ts'
import { generateFallbackData } from './fallback-generator.ts'
import { fetchFlightDataFromAPI } from './api-client.ts'
import { validateRequest, isFlightToday } from './validation.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { flightNumber, tripDate, priority = 1 } = await req.json()
    
    validateRequest(flightNumber)

    console.log('Consultando datos para vuelo:', flightNumber, 'fecha:', tripDate, 'prioridad:', priority)

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Verificar caché primero
    const cacheResult = await checkCache(supabaseClient, flightNumber)
    if (cacheResult) {
      console.log('📋 Datos obtenidos del caché para vuelo:', flightNumber)
      return new Response(
        JSON.stringify(cacheResult),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    // Verificar si es vuelo de hoy usando zona horaria de Bogotá
    if (!isFlightToday(tripDate)) {
      console.log('🚫 Vuelo no es de hoy (zona horaria Bogotá), usando fallback basado en fecha')
      const fallbackData = await generateFallbackData(flightNumber, tripDate)
      return new Response(
        JSON.stringify(fallbackData),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    // Verificar límite diario de consultas
    const dailyUsage = await getDailyApiUsage(supabaseClient)
    console.log('📊 Uso diario actual de API:', dailyUsage, '/', MAX_DAILY_QUERIES)
    
    if (hasReachedDailyLimit(dailyUsage)) {
      console.log('🚫 Límite diario de consultas alcanzado, usando fallback')
      const fallbackData = await generateFallbackData(flightNumber, tripDate)
      return new Response(
        JSON.stringify(fallbackData),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    // Verificar si hay otros vuelos de mayor prioridad pendientes
    const shouldSkipForPriority = await checkPriorityQueue(supabaseClient, priority)
    if (shouldSkipForPriority) {
      console.log('🔄 Vuelo de menor prioridad, postergando consulta API')
      const fallbackData = await generateFallbackData(flightNumber, tripDate)
      return new Response(
        JSON.stringify(fallbackData),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    // Realizar consulta a la API
    const apiKey = Deno.env.get('AVIATIONSTACK_API_KEY')
    
    if (!apiKey) {
      console.log('❌ API key no disponible, usando fallback')
      const fallbackData = await generateFallbackData(flightNumber, tripDate)
      return new Response(
        JSON.stringify(fallbackData),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    const data = await fetchFlightDataFromAPI(flightNumber, apiKey)

    // Registrar uso de API
    await recordApiUsage(supabaseClient, flightNumber)
    console.log('✅ Consulta API registrada correctamente')

    if (data.error) {
      console.error('Error de API de AviationStack:', data.error)
      const fallbackData = await generateFallbackData(flightNumber, tripDate)
      fallbackData._fallback = true
      fallbackData._reason = 'api_error'
      return new Response(
        JSON.stringify(fallbackData),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    if (!data.data || data.data.length === 0) {
      console.log('❌ No se encontraron datos para el vuelo en la API')
      const fallbackData = await generateFallbackData(flightNumber, tripDate)
      fallbackData._fallback = true
      fallbackData._reason = 'no_data'
      return new Response(
        JSON.stringify(fallbackData),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    const flightData = data.data[0]
    
    // Guardar en caché
    await saveToCache(supabaseClient, flightNumber, flightData)
    console.log('💾 Datos guardados en caché correctamente')
    
    console.log('✅ Datos REALES completos del vuelo obtenidos de API:', {
      flight_status: flightData.flight_status,
      airline: flightData.airline?.name,
      aircraft: flightData.aircraft?.registration,
      departure: {
        airport: flightData.departure?.airport,
        iata: flightData.departure?.iata,
        icao: flightData.departure?.icao,
        terminal: flightData.departure?.terminal,
        gate: flightData.departure?.gate,
        scheduled: flightData.departure?.scheduled,
        actual: flightData.departure?.actual,
        timezone: flightData.departure?.timezone
      },
      arrival: {
        airport: flightData.arrival?.airport,
        iata: flightData.arrival?.iata,
        icao: flightData.arrival?.icao,
        terminal: flightData.arrival?.terminal,
        gate: flightData.arrival?.gate,
        scheduled: flightData.arrival?.scheduled,
        actual: flightData.arrival?.actual,
        timezone: flightData.arrival?.timezone
      }
    })

    // Capturar TODOS los datos disponibles de la API sin modificaciones
    flightData._fallback = false
    flightData._source = 'aviationstack_api'
    
    // Extraer información completa de aeropuertos y ciudades EXACTAMENTE como viene de la API
    if (flightData.departure) {
      flightData.api_departure_airport = flightData.departure.iata || flightData.departure.icao || 'N/A'
      flightData.api_departure_city = flightData.departure.airport || 'Ciudad no disponible'
      flightData.api_departure_gate = flightData.departure.gate || null
      flightData.api_departure_terminal = flightData.departure.terminal || null
    }
    
    if (flightData.arrival) {
      flightData.api_arrival_airport = flightData.arrival.iata || flightData.arrival.icao || 'N/A'
      flightData.api_arrival_city = flightData.arrival.airport || 'Ciudad no disponible'
      flightData.api_arrival_gate = flightData.arrival.gate || null
      flightData.api_arrival_terminal = flightData.arrival.terminal || null
    }

    // Información adicional de la aeronave
    if (flightData.aircraft) {
      flightData.api_aircraft = flightData.aircraft.registration || flightData.aircraft.iata || null
    }

    // Estado exacto del vuelo de la API
    flightData.api_flight_status = flightData.flight_status

    console.log('🎯 Datos completos extraídos de la API:', {
      api_departure_city: flightData.api_departure_city,
      api_arrival_city: flightData.api_arrival_city,
      api_departure_airport: flightData.api_departure_airport,
      api_arrival_airport: flightData.api_arrival_airport,
      api_departure_gate: flightData.api_departure_gate,
      api_arrival_gate: flightData.api_arrival_gate,
      api_departure_terminal: flightData.api_departure_terminal,
      api_arrival_terminal: flightData.api_arrival_terminal,
      api_aircraft: flightData.api_aircraft,
      api_flight_status: flightData.api_flight_status,
      departure_scheduled: flightData.departure?.scheduled,
      departure_actual: flightData.departure?.actual,
      arrival_scheduled: flightData.arrival?.scheduled,
      arrival_actual: flightData.arrival?.actual
    })

    return new Response(
      JSON.stringify(flightData),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('💥 Error crítico en get-flight-data:', error)
    
    // En caso de error, intentar generar datos de fallback
    try {
      const { flightNumber, tripDate } = await req.json()
      const fallbackData = await generateFallbackData(flightNumber, tripDate)
      fallbackData._fallback = true
      fallbackData._reason = 'critical_error'
      return new Response(
        JSON.stringify(fallbackData),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    } catch {
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
  }
})
