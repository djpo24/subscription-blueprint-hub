import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const MAX_DAILY_QUERIES = 4
const CACHE_DURATION_HOURS = 2

// Función para obtener la fecha actual en zona horaria de Bogotá
function getBogotaDate() {
  const now = new Date();
  const bogotaTime = new Date(now.toLocaleString("en-US", {timeZone: "America/Bogota"}));
  console.log('Fecha y hora actual en Bogotá:', bogotaTime.toISOString());
  return bogotaTime;
}

// Función para obtener solo la fecha en formato YYYY-MM-DD en zona horaria de Bogotá
function getBogotaDateString() {
  const bogotaDate = getBogotaDate();
  return bogotaDate.getFullYear() + '-' + 
         String(bogotaDate.getMonth() + 1).padStart(2, '0') + '-' + 
         String(bogotaDate.getDate()).padStart(2, '0');
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { flightNumber, tripDate, priority = 1 } = await req.json()
    
    if (!flightNumber) {
      throw new Error('Flight number is required')
    }

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
    const today = getBogotaDateString();
    const flightDate = new Date(tripDate).toISOString().split('T')[0]
    
    console.log('Comparando fechas - Hoy en Bogotá:', today, 'Fecha del vuelo:', flightDate)
    
    if (flightDate !== today) {
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
    if (dailyUsage >= MAX_DAILY_QUERIES) {
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
      console.log('API key no disponible, usando fallback')
      const fallbackData = await generateFallbackData(flightNumber, tripDate)
      return new Response(
        JSON.stringify(fallbackData),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    console.log('✈️ Realizando consulta a AviationStack API')
    const apiUrl = `http://api.aviationstack.com/v1/flights?access_key=${apiKey}&flight_iata=${flightNumber}&limit=1`
    
    const response = await fetch(apiUrl)
    const data = await response.json()

    // Registrar uso de API
    await recordApiUsage(supabaseClient, flightNumber)

    console.log('Respuesta de AviationStack API:', {
      data: data?.data?.length || 0,
      error: data?.error || null
    })

    if (data.error) {
      console.error('Error de API de AviationStack:', data.error)
      const fallbackData = await generateFallbackData(flightNumber, tripDate)
      return new Response(
        JSON.stringify(fallbackData),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    if (!data.data || data.data.length === 0) {
      console.log('No se encontraron datos para el vuelo en la API')
      const fallbackData = await generateFallbackData(flightNumber, tripDate)
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
    
    console.log('✅ Datos del vuelo obtenidos de API y guardados en caché:', {
      flight_status: flightData.flight_status,
      airline: flightData.airline?.name,
      departure: flightData.departure?.airport,
      arrival: flightData.arrival?.airport
    })

    return new Response(
      JSON.stringify(flightData),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error en get-flight-data:', error)
    
    // En caso de error, intentar generar datos de fallback
    try {
      const { flightNumber, tripDate } = await req.json()
      const fallbackData = await generateFallbackData(flightNumber, tripDate)
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

// Funciones auxiliares
async function checkCache(supabaseClient: any, flightNumber: string) {
  const cacheExpiry = new Date()
  cacheExpiry.setHours(cacheExpiry.getHours() - CACHE_DURATION_HOURS)
  
  const { data, error } = await supabaseClient
    .from('flight_api_cache')
    .select('*')
    .eq('flight_number', flightNumber)
    .gte('created_at', cacheExpiry.toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .single()
  
  if (error || !data) return null
  
  try {
    return JSON.parse(data.api_response)
  } catch {
    return null
  }
}

async function saveToCache(supabaseClient: any, flightNumber: string, apiData: any) {
  const today = getBogotaDateString();
  await supabaseClient
    .from('flight_api_cache')
    .insert({
      flight_number: flightNumber,
      api_response: JSON.stringify(apiData),
      query_date: today
    })
}

async function getDailyApiUsage(supabaseClient: any) {
  const today = getBogotaDateString();
  
  const { data, error } = await supabaseClient
    .from('flight_api_usage')
    .select('*', { count: 'exact' })
    .eq('query_date', today)
  
  return data?.length || 0
}

async function recordApiUsage(supabaseClient: any, flightNumber: string) {
  const today = getBogotaDateString();
  const bogotaTime = getBogotaDate();
  
  await supabaseClient
    .from('flight_api_usage')
    .insert({
      flight_number: flightNumber,
      query_date: today,
      query_time: bogotaTime.toISOString()
    })
}

async function checkPriorityQueue(supabaseClient: any, currentPriority: number) {
  if (currentPriority >= 3) return false // Alta prioridad, no postponer
  
  // Verificar si hay vuelos de mayor prioridad pendientes hoy
  const today = getBogotaDateString();
  
  const { data: highPriorityFlights } = await supabaseClient
    .from('packages')
    .select('flight_number', { count: 'exact' })
    .not('flight_number', 'is', null)
    .gte('created_at', today)
    .group('flight_number')
    .having('count(*)', 'gte', 3) // 3 o más paquetes = alta prioridad
  
  return (highPriorityFlights?.length || 0) > 0 && currentPriority < 3
}

async function generateFallbackData(flightNumber: string, tripDate: string) {
  const bogotaTime = getBogotaDate();
  const flightDate = new Date(tripDate)
  const todayBogota = new Date(bogotaTime.getFullYear(), bogotaTime.getMonth(), bogotaTime.getDate())
  const flightDateOnly = new Date(flightDate.getFullYear(), flightDate.getMonth(), flightDate.getDate())
  
  // Generar horarios realistas basados en el número de vuelo
  const flightNum = parseInt(flightNumber.replace(/\D/g, '')) || 100
  const baseHour = 6 + (flightNum % 12) // Entre 6 AM y 6 PM
  const baseMinutes = (flightNum % 4) * 15 // 0, 15, 30, 45 minutos
  
  const scheduledDeparture = new Date(flightDate)
  scheduledDeparture.setHours(baseHour, baseMinutes, 0, 0)
  
  const scheduledArrival = new Date(scheduledDeparture)
  scheduledArrival.setHours(scheduledArrival.getHours() + 2) // 2 horas de vuelo
  
  let status = 'scheduled'
  let actualDeparture = null
  let actualArrival = null
  
  // Lógica de estado basada en fecha y hora (usando zona horaria de Bogotá)
  if (flightDateOnly < todayBogota) {
    status = 'landed'
    actualDeparture = scheduledDeparture.toISOString()
    actualArrival = scheduledArrival.toISOString()
  } else if (flightDateOnly.getTime() === todayBogota.getTime()) {
    const currentTime = bogotaTime.getTime()
    if (currentTime >= scheduledArrival.getTime()) {
      status = 'landed'
      actualDeparture = scheduledDeparture.toISOString()
      actualArrival = scheduledArrival.toISOString()
    } else if (currentTime >= scheduledDeparture.getTime()) {
      status = 'active'
      actualDeparture = scheduledDeparture.toISOString()
    }
  }
  
  return {
    flight_status: status,
    departure: {
      scheduled: scheduledDeparture.toISOString(),
      actual: actualDeparture,
      airport: 'BOG' // Default para Bogotá
    },
    arrival: {
      scheduled: scheduledArrival.toISOString(),
      actual: actualArrival,
      airport: 'MDE' // Default para Medellín
    },
    airline: {
      name: 'Avianca'
    },
    flight: {
      iata: flightNumber
    },
    _fallback: true // Indicador de que son datos de fallback
  }
}
