
import { createSuccessResponse } from './response-handler.ts';

export async function handleCacheCheck(supabaseClient: any, flightNumber: string): Promise<Response | null> {
  const { checkCache } = await import('./cache-service.ts');
  
  const cacheResult = await checkCache(supabaseClient, flightNumber);
  if (cacheResult) {
    console.log('📋 Datos obtenidos del caché para vuelo:', flightNumber);
    return createSuccessResponse(cacheResult);
  }
  
  return null;
}

export async function saveCacheData(supabaseClient: any, flightNumber: string, processedData: any): Promise<void> {
  const { saveToCache } = await import('./cache-service.ts');
  
  await saveToCache(supabaseClient, flightNumber, processedData);
  console.log('💾 Datos guardados en caché correctamente');
}
