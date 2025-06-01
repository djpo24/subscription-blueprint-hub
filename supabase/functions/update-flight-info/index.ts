
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

    const aviationStackApiKey = Deno.env.get('AVIATIONSTACK_API_KEY')
    if (!aviationStackApiKey) {
      throw new Error('AVIATIONSTACK_API_KEY no está configurada')
    }

    // Obtener el parámetro flight_number del body de la request
    const { flight_number } = await req.json()
    
    if (!flight_number) {
      return new Response(
        JSON.stringify({ error: 'flight_number parameter is required' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    console.log(`🔍 Consultando API para vuelo: ${flight_number}`)

    // Consultar la API de AviationStack con más parámetros para obtener datos completos
    const apiUrl = `http://api.aviationstack.com/v1/flights?access_key=${aviationStackApiKey}&flight_iata=${flight_number}&limit=1`
    
    console.log('📡 Haciendo consulta completa a AviationStack API...')
    const response = await fetch(apiUrl)
    
    if (!response.ok) {
      throw new Error(`Error de API: ${response.status} ${response.statusText}`)
    }

    const apiData = await response.json()
    console.log('📋 Respuesta COMPLETA de la API:', JSON.stringify(apiData, null, 2))

    if (!apiData.data || apiData.data.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No se encontró información para este vuelo' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404 
        }
      )
    }

    const flightInfo = apiData.data[0]
    console.log('✈️ Información COMPLETA del vuelo obtenida:', JSON.stringify(flightInfo, null, 2))

    // Extraer TODA la información relevante de la API
    const updateData = {
      // Información básica del vuelo
      airline: flightInfo.airline?.name || 'Unknown',
      status: flightInfo.flight_status || 'unknown',
      
      // Fechas programadas y reales
      scheduled_departure: flightInfo.departure?.scheduled || null,
      actual_departure: flightInfo.departure?.actual || null,
      scheduled_arrival: flightInfo.arrival?.scheduled || null,
      actual_arrival: flightInfo.arrival?.actual || null,
      
      // Aeropuertos (mantener compatibilidad con datos existentes)
      departure_airport: flightInfo.departure?.airport || null,
      arrival_airport: flightInfo.arrival?.airport || null,
      
      // NUEVA INFORMACIÓN DE LA API - Ciudades y aeropuertos detallados
      api_departure_city: flightInfo.departure?.airport || null, // En algunos casos el campo airport contiene la ciudad
      api_arrival_city: flightInfo.arrival?.airport || null,
      api_departure_airport: flightInfo.departure?.airport || null,
      api_arrival_airport: flightInfo.arrival?.airport || null,
      
      // Códigos IATA e ICAO
      api_departure_iata: flightInfo.departure?.iata || null,
      api_arrival_iata: flightInfo.arrival?.iata || null,
      api_departure_icao: flightInfo.departure?.icao || null,
      api_arrival_icao: flightInfo.arrival?.icao || null,
      
      // Información de terminal y puerta
      api_departure_gate: flightInfo.departure?.gate || null,
      api_arrival_gate: flightInfo.arrival?.gate || null,
      api_departure_terminal: flightInfo.departure?.terminal || null,
      api_arrival_terminal: flightInfo.arrival?.terminal || null,
      
      // Zonas horarias
      api_departure_timezone: flightInfo.departure?.timezone || null,
      api_arrival_timezone: flightInfo.arrival?.timezone || null,
      
      // Información de la aerolínea
      api_airline_name: flightInfo.airline?.name || null,
      api_airline_iata: flightInfo.airline?.iata || null,
      api_airline_icao: flightInfo.airline?.icao || null,
      
      // Información de la aeronave
      api_aircraft: flightInfo.aircraft?.registration || null,
      api_aircraft_iata: flightInfo.aircraft?.iata || null,
      api_aircraft_registration: flightInfo.aircraft?.registration || null,
      
      // Estado del vuelo según la API
      api_flight_status: flightInfo.flight_status || null,
      
      // Almacenar TODOS los datos raw de la API para referencia futura
      api_raw_data: flightInfo,
      
      // Actualizar timestamp
      last_updated: new Date().toISOString()
    }

    // Determinar si el vuelo ha aterrizado según la API
    if (flightInfo.flight_status === 'landed' || flightInfo.arrival?.actual) {
      updateData.has_landed = true
    }

    console.log('💾 Datos COMPLETOS a actualizar en la base de datos:', JSON.stringify(updateData, null, 2))

    // Primero verificar si el vuelo existe
    const { data: existingFlight, error: checkError } = await supabaseClient
      .from('flight_data')
      .select('*')
      .eq('flight_number', flight_number.toLowerCase())
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error verificando vuelo existente:', checkError)
      throw checkError
    }

    let result
    if (existingFlight) {
      // Actualizar vuelo existente
      console.log('🔄 Actualizando vuelo existente...')
      const { data: updatedFlight, error: updateError } = await supabaseClient
        .from('flight_data')
        .update(updateData)
        .eq('flight_number', flight_number.toLowerCase())
        .select()
        .single()

      if (updateError) {
        console.error('Error actualizando flight_data:', updateError)
        throw updateError
      }
      result = updatedFlight
    } else {
      // Crear nuevo registro de vuelo
      console.log('➕ Creando nuevo registro de vuelo...')
      const { data: newFlight, error: insertError } = await supabaseClient
        .from('flight_data')
        .insert({
          flight_number: flight_number.toLowerCase(),
          ...updateData
        })
        .select()
        .single()

      if (insertError) {
        console.error('Error insertando flight_data:', insertError)
        throw insertError
      }
      result = newFlight
    }

    console.log('✅ Vuelo procesado exitosamente:', result)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Información completa del vuelo capturada y almacenada exitosamente',
        flightData: result,
        apiResponse: flightInfo,
        dataUpdated: {
          basicInfo: '✅ Información básica del vuelo',
          schedules: '✅ Horarios programados y reales',
          airports: '✅ Aeropuertos de origen y destino',
          cities: '✅ Ciudades de origen y destino',
          codes: '✅ Códigos IATA e ICAO',
          gates: '✅ Puertas y terminales',
          timezones: '✅ Zonas horarias',
          airline: '✅ Información detallada de aerolínea',
          aircraft: '✅ Información de aeronave',
          rawData: '✅ Datos completos de la API almacenados'
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('❌ Error en update-flight-info:', error)
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
