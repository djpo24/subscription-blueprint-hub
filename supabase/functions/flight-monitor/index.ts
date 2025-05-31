
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

    console.log('Iniciando monitoreo automático de vuelos...')

    // Obtener todos los vuelos que necesitan ser monitoreados
    const { data: flights, error: flightsError } = await supabaseClient
      .from('flight_data')
      .select('*')
      .eq('has_landed', false)
      .not('flight_number', 'is', null)

    if (flightsError) {
      console.error('Error obteniendo vuelos:', flightsError)
      throw flightsError
    }

    console.log(`Monitoreando ${flights?.length || 0} vuelos`)

    const updatedFlights = []

    for (const flight of flights || []) {
      try {
        // Simular consulta a API de vuelos (aquí usarías una API real como FlightAware, AviationStack, etc.)
        const flightStatus = await checkFlightStatus(flight.flight_number)
        
        if (flightStatus.hasLanded && !flight.has_landed) {
          // Actualizar estado del vuelo
          const { error: updateError } = await supabaseClient
            .from('flight_data')
            .update({
              has_landed: true,
              actual_arrival: flightStatus.actualArrival,
              status: 'arrived',
              last_updated: new Date().toISOString()
            })
            .eq('id', flight.id)

          if (updateError) {
            console.error('Error actualizando vuelo:', updateError)
          } else {
            console.log(`Vuelo ${flight.flight_number} marcado como aterrizado`)
            updatedFlights.push(flight.flight_number)
          }
        }
      } catch (error) {
        console.error(`Error monitoreando vuelo ${flight.flight_number}:`, error)
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        monitored: flights?.length || 0,
        updated: updatedFlights.length,
        updatedFlights
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error en flight-monitor:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})

// Función para verificar el estado de un vuelo
async function checkFlightStatus(flightNumber: string) {
  // Aquí implementarías la integración con una API real de vuelos
  // Por ahora simularemos algunos vuelos que aterrizan
  
  const simulatedLandedFlights = ['AV123', 'AV456', 'LA789']
  const hasLanded = simulatedLandedFlights.includes(flightNumber)
  
  // Simular algunos vuelos que llegan en diferentes momentos
  const now = new Date()
  const arrivalTime = new Date(now.getTime() - Math.random() * 2 * 60 * 60 * 1000) // Hasta 2 horas atrás
  
  return {
    hasLanded,
    actualArrival: hasLanded ? arrivalTime.toISOString() : null,
    status: hasLanded ? 'arrived' : 'in_flight'
  }
}
