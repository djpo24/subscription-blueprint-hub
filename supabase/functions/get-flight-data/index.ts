
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
    const { flightNumber, tripDate } = await req.json()
    
    if (!flightNumber) {
      throw new Error('Flight number is required')
    }

    console.log('Consultando datos para vuelo:', flightNumber, 'fecha:', tripDate)

    const apiKey = Deno.env.get('AVIATIONSTACK_API_KEY')
    
    if (!apiKey) {
      console.log('API key no disponible')
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    // Construir URL de la API de AviationStack
    const apiUrl = `http://api.aviationstack.com/v1/flights?access_key=${apiKey}&flight_iata=${flightNumber}&limit=1`
    
    const response = await fetch(apiUrl)
    const data = await response.json()

    console.log('Respuesta de AviationStack API:', {
      data: data?.data?.length || 0,
      error: data?.error || null
    })

    if (data.error) {
      console.error('Error de API de AviationStack:', data.error)
      return new Response(
        JSON.stringify({ error: data.error }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    if (!data.data || data.data.length === 0) {
      console.log('No se encontraron datos para el vuelo en la API')
      return new Response(
        JSON.stringify({ message: 'No flight data found' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404 
        }
      )
    }

    const flightData = data.data[0]
    
    console.log('Datos del vuelo obtenidos:', {
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
