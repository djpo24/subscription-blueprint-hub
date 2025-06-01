
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

    // Obtener el parámetro flight_number de la URL
    const url = new URL(req.url)
    const flightNumber = url.searchParams.get('flight_number')
    
    if (!flightNumber) {
      return new Response(
        JSON.stringify({ error: 'flight_number parameter is required' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    console.log(`Consultando API para vuelo: ${flightNumber}`)

    // Consultar la API de AviationStack
    const apiUrl = `http://api.aviationstack.com/v1/flights?access_key=${aviationStackApiKey}&flight_iata=${flightNumber}&limit=1`
    
    console.log('Haciendo consulta a AviationStack API...')
    const response = await fetch(apiUrl)
    
    if (!response.ok) {
      throw new Error(`Error de API: ${response.status} ${response.statusText}`)
    }

    const apiData = await response.json()
    console.log('Respuesta de la API:', JSON.stringify(apiData, null, 2))

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
    console.log('Información del vuelo obtenida:', JSON.stringify(flightInfo, null, 2))

    // Extraer información relevante
    const updateData = {
      api_departure_city: flightInfo.departure?.airport || null,
      api_arrival_city: flightInfo.arrival?.airport || null,
      api_departure_airport: flightInfo.departure?.airport || null,
      api_arrival_airport: flightInfo.arrival?.airport || null,
      api_departure_gate: flightInfo.departure?.gate || null,
      api_arrival_gate: flightInfo.arrival?.gate || null,
      api_departure_terminal: flightInfo.departure?.terminal || null,
      api_arrival_terminal: flightInfo.arrival?.terminal || null,
      api_aircraft: flightInfo.aircraft?.registration || null,
      api_flight_status: flightInfo.flight_status || null,
      api_departure_iata: flightInfo.departure?.iata || null,
      api_arrival_iata: flightInfo.arrival?.iata || null,
      api_departure_icao: flightInfo.departure?.icao || null,
      api_arrival_icao: flightInfo.arrival?.icao || null,
      api_departure_timezone: flightInfo.departure?.timezone || null,
      api_arrival_timezone: flightInfo.arrival?.timezone || null,
      api_airline_name: flightInfo.airline?.name || null,
      api_airline_iata: flightInfo.airline?.iata || null,
      api_airline_icao: flightInfo.airline?.icao || null,
      api_aircraft_iata: flightInfo.aircraft?.iata || null,
      api_aircraft_registration: flightInfo.aircraft?.registration || null,
      api_raw_data: flightInfo,
      last_updated: new Date().toISOString()
    }

    // Si hay fechas en la respuesta, también las actualizamos
    if (flightInfo.departure?.scheduled) {
      updateData.scheduled_departure = flightInfo.departure.scheduled
    }
    if (flightInfo.arrival?.scheduled) {
      updateData.scheduled_arrival = flightInfo.arrival.scheduled
    }
    if (flightInfo.departure?.actual) {
      updateData.actual_departure = flightInfo.departure.actual
    }
    if (flightInfo.arrival?.actual) {
      updateData.actual_arrival = flightInfo.arrival.actual
      updateData.has_landed = true
    }

    console.log('Datos a actualizar:', JSON.stringify(updateData, null, 2))

    // Actualizar la base de datos
    const { data: updatedFlight, error: updateError } = await supabaseClient
      .from('flight_data')
      .update(updateData)
      .eq('flight_number', flightNumber)
      .select()

    if (updateError) {
      console.error('Error actualizando flight_data:', updateError)
      throw updateError
    }

    console.log('Vuelo actualizado exitosamente:', updatedFlight)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Información del vuelo actualizada exitosamente',
        flightData: updatedFlight?.[0] || null,
        apiResponse: flightInfo
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error en update-flight-info:', error)
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
