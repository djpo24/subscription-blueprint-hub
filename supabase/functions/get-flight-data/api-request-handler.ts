
import { fetchFlightDataFromAPI } from './api-client.ts';
import { processFlightData } from './data-processor.ts';
import { recordApiUsage } from './api-usage-service.ts';
import { generateFallbackData } from './fallback-generator.ts';
import { createSuccessResponse, createErrorResponse } from './response-handler.ts';
import { saveCacheData } from './cache-handler.ts';

export async function handleApiRequest(
  supabaseClient: any,
  flightNumber: string,
  tripDate: string
): Promise<Response> {
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
  await saveCacheData(supabaseClient, flightNumber, processedFlightData);

  return createSuccessResponse(processedFlightData);
}
