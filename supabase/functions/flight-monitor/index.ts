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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const bogotaDateString = getBogotaDateString();
    
    console.log('=== INICIO MONITOREO INTELIGENTE DE VUELOS ===')
    console.log('Fecha actual en Bogotá:', bogotaDateString)
    console.log('SUPABASE_URL:', Deno.env.get('SUPABASE_URL'))
    console.log('SERVICE_ROLE_KEY disponible:', !!Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'))
    console.log('AVIATIONSTACK_API_KEY disponible:', !!Deno.env.get('AVIATIONSTACK_API_KEY'))

    // Obtener TODOS los vuelos (incluso los que ya aterraron) para análisis completo
    console.log('Consultando todos los vuelos para análisis...')
    const { data: allFlights, error: allFlightsError } = await supabaseClient
      .from('flight_data')
      .select('*')
      .not('flight_number', 'is', null)

    if (allFlightsError) {
      console.error('Error obteniendo todos los vuelos:', allFlightsError)
      throw allFlightsError
    }

    console.log('Total de vuelos en BD:', allFlights?.length || 0)

    // Filtrar vuelos que necesitan monitoreo (no aterrizados O aterrizados pero no notificados)
    const flightsToMonitor = allFlights?.filter(flight => 
      !flight.has_landed || (flight.has_landed && !flight.notification_sent)
    ) || []

    console.log('Vuelos que necesitan monitoreo:', flightsToMonitor.length)
    console.log('Detalle:', flightsToMonitor.map(f => ({
      flight: f.flight_number,
      has_landed: f.has_landed,
      notification_sent: f.notification_sent,
      status: f.status
    })))

    // Obtener todos los viajes para calcular prioridades
    const { data: trips, error: tripsError } = await supabaseClient
      .from('trips')
      .select('*')

    if (tripsError) {
      console.error('Error obteniendo viajes:', tripsError)
      throw tripsError
    }

    // Calcular prioridades y ordenar vuelos
    const flightsWithPriority = await calculateFlightPriorities(supabaseClient, flightsToMonitor)
    const sortedFlights = flightsWithPriority.sort((a, b) => b.priority - a.priority)

    console.log('Vuelos ordenados por prioridad para monitoreo:', sortedFlights.map(f => ({
      flight: f.flight_number,
      priority: f.priority,
      packages: f.packageCount,
      has_landed: f.has_landed,
      notification_sent: f.notification_sent
    })))

    const updatedFlights: string[] = []
    let totalFlightsInDb = allFlights?.length || 0

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
      console.log('⚠️ No se encontraron vuelos que necesiten monitoreo')
    }

    // Mostrar estadísticas de uso de API
    const dailyUsage = await getDailyApiUsage(supabaseClient)
    console.log(`📊 Uso de API hoy: ${dailyUsage}/4 consultas`)

    const result: MonitoringResult = { 
      success: true, 
      monitored: sortedFlights.length,
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
