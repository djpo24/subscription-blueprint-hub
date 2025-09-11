
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

    // Primero, verificar qué vuelos existen en total en flight_data
    console.log('Consultando TODOS los vuelos en flight_data...')
    const { data: allFlights, error: allFlightsError } = await supabaseClient
      .from('flight_data')
      .select('*')

    console.log('Todos los vuelos encontrados:', allFlights?.length || 0)
    if (allFlightsError) {
      console.error('Error consultando todos los vuelos:', allFlightsError)
    }

    // Obtener vuelos que necesitan ser monitoreados
    console.log('Consultando vuelos para monitorear...')
    const { data: flights, error: flightsError } = await supabaseClient
      .from('flight_data')
      .select('*')
      .eq('has_landed', false)
      .not('flight_number', 'is', null)

    console.log('Query para vuelos a monitorear:')
    console.log('- has_landed = false')
    console.log('- flight_number IS NOT NULL')
    console.log('Resultados:', flights?.length || 0)

    if (flightsError) {
      console.error('Error obteniendo vuelos para monitorear:', flightsError)
      throw flightsError
    }

    if (flights && flights.length > 0) {
      console.log('Vuelos encontrados para monitorear:', flights.map(f => ({
        id: f.id,
        flight_number: f.flight_number,
        status: f.status,
        has_landed: f.has_landed
      })))
    }

    const updatedFlights = []

    if (flights && flights.length > 0) {
      for (const flight of flights) {
        try {
          console.log(`--- Verificando vuelo: ${flight.flight_number} ---`)
          
          // Simular consulta a API de vuelos
          const flightStatus = await checkFlightStatus(flight.flight_number)
          console.log(`Estado del vuelo ${flight.flight_number}:`, flightStatus)
          
          if (flightStatus.hasLanded && !flight.has_landed) {
            console.log(`✈️ Vuelo ${flight.flight_number} ha aterrizado - actualizando...`)
            
            // Actualizar estado del vuelo
            const { data: updatedFlight, error: updateError } = await supabaseClient
              .from('flight_data')
              .update({
                has_landed: true,
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
              console.log('Datos actualizados:', updatedFlight)
              updatedFlights.push(flight.flight_number)
            }
          } else {
            console.log(`🛫 Vuelo ${flight.flight_number} aún en vuelo (hasLanded: ${flightStatus.hasLanded}, current has_landed: ${flight.has_landed})`)
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
      updatedFlights,
      totalFlightsInDb: allFlights?.length || 0
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

// Función para verificar el estado de un vuelo
async function checkFlightStatus(flightNumber: string) {
  console.log(`Verificando estado del vuelo: ${flightNumber}`)
  
  // Simulación mejorada - algunos vuelos específicos "aterrizan"
  const simulatedLandedFlights = ['AV123', 'AV456', 'LA789', 'AV101', 'AV102', 'AV001', 'AV002']
  const hasLanded = simulatedLandedFlights.includes(flightNumber)
  
  // Simular hora de llegada
  const now = new Date()
  const arrivalTime = new Date(now.getTime() - Math.random() * 2 * 60 * 60 * 1000) // Hasta 2 horas atrás
  
  const status = {
    hasLanded,
    actualArrival: hasLanded ? arrivalTime.toISOString() : null,
    status: hasLanded ? 'arrived' : 'in_flight'
  }
  
  console.log(`Estado simulado para ${flightNumber}:`, status)
  return status
}
