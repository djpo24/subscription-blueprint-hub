
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { checkCache, saveToCache } from './cache-service.ts';
import { getDailyApiUsage, recordApiUsage, hasReachedDailyLimit } from './api-usage-service.ts';
import { checkPriorityQueue } from './priority-queue.ts';
import { generateFallbackData } from './fallback-generator.ts';
import { fetchFlightDataFromAPI } from './api-client.ts';
import { validateRequest, isFlightToday } from './validation.ts';
import { processFlightData } from './data-processor.ts';
import { createSuccessResponse, createErrorResponse } from './response-handler.ts';
import type { FallbackFlightData } from './types.ts';

export async function handleFlightRequest(
  flightNumber: string, 
  tripDate: string, 
  priority: number = 1
): Promise<Response> {
  console.log('Consultando datos para vuelo:', flightNumber, 'fecha:', tripDate, 'prioridad:', priority);

  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  // Verificar caché primero
  const cacheResult = await checkCache(supabaseClient, flightNumber);
  if (cacheResult) {
    console.log('📋 Datos obtenidos del caché para vuelo:', flightNumber);
    return createSuccessResponse(cacheResult);
  }

  // Verificar si es vuelo de hoy usando zona horaria de Bogotá
  if (!isFlightToday(tripDate)) {
    console.log('🚫 Vuelo no es de hoy (zona horaria Bogotá), usando fallback basado en fecha');
    const fallbackData = await generateFallbackData(flightNumber, tripDate);
    return createErrorResponse(fallbackData);
  }

  // Verificar límite diario de consultas
  const dailyUsage = await getDailyApiUsage(supabaseClient);
  console.log('📊 Uso diario actual de API:', dailyUsage, '/ 4');
  
  if (hasReachedDailyLimit(dailyUsage)) {
    console.log('🚫 Límite diario de consultas alcanzado, usando fallback');
    const fallbackData = await generateFallbackData(flightNumber, tripDate);
    return createErrorResponse(fallbackData);
  }

  // Verificar si hay otros vuelos de mayor prioridad pendientes
  const shouldSkipForPriority = await checkPriorityQueue(supabaseClient, priority);
  if (shouldSkipForPriority) {
    console.log('🔄 Vuelo de menor prioridad, postergando consulta API');
    const fallbackData = await generateFallbackData(flightNumber, tripDate);
    return createErrorResponse(fallbackData);
  }

  // Realizar consulta a la API
  const apiKey = Deno.env.get('AVIATIONSTACK_API_KEY');
  
  if (!apiKey) {
    console.log('❌ API key no disponible, usando fallback');
    const fallbackData = await generateFallbackData(flightNumber, tripDate);
    return createErrorResponse(fallbackData);
  }

  const data = await fetchFlightDataFromAPI(flightNumber, apiKey);

  // Registrar uso de API
  await recordApiUsage(supabaseClient, flightNumber);
  console.log('✅ Consulta API registrada correctamente');

  if (data.error) {
    console.error('Error de API de AviationStack:', data.error);
    const fallbackData = await generateFallbackData(flightNumber, tripDate);
    fallbackData._fallback = true;
    fallbackData._reason = 'api_error';
    return createErrorResponse(fallbackData);
  }

  if (!data.data || data.data.length === 0) {
    console.log('❌ No se encontraron datos para el vuelo en la API');
    const fallbackData = await generateFallbackData(flightNumber, tripDate);
    fallbackData._fallback = true;
    fallbackData._reason = 'no_data';
    return createErrorResponse(fallbackData);
  }

  const flightData = data.data[0];
  
  // Procesar y enriquecer los datos del vuelo
  const processedFlightData = processFlightData(flightData);
  
  // Guardar en caché
  await saveToCache(supabaseClient, flightNumber, processedFlightData);
  console.log('💾 Datos guardados en caché correctamente');

  return createSuccessResponse(processedFlightData);
}

export async function handleFallbackError(
  flightNumber?: string, 
  tripDate?: string
): Promise<Response> {
  if (!flightNumber || !tripDate) {
    return createErrorResponse({
      flight_status: 'error',
      departure: {
        scheduled: new Date().toISOString(),
        actual: null,
        airport: 'BOG'
      },
      arrival: {
        scheduled: new Date().toISOString(),
        actual: null,
        airport: 'MDE'
      },
      airline: {
        name: 'Unknown'
      },
      flight: {
        iata: 'UNKNOWN'
      },
      _fallback: true,
      _reason: 'critical_error'
    });
  }

  const fallbackData = await generateFallbackData(flightNumber, tripDate);
  fallbackData._fallback = true;
  fallbackData._reason = 'critical_error';
  return createErrorResponse(fallbackData);
}
