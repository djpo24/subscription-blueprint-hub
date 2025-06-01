
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { getDailyApiUsage, hasReachedDailyLimit } from './api-usage-service.ts';
import { checkPriorityQueue } from './priority-queue.ts';
import { generateFallbackData } from './fallback-generator.ts';
import { isFlightToday } from './validation.ts';
import { createErrorResponse } from './response-handler.ts';
import { handleCacheCheck } from './cache-handler.ts';
import { handleApiRequest } from './api-request-handler.ts';

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
  const cacheResult = await handleCacheCheck(supabaseClient, flightNumber);
  if (cacheResult) {
    return cacheResult;
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
  return await handleApiRequest(supabaseClient, flightNumber, tripDate);
}
