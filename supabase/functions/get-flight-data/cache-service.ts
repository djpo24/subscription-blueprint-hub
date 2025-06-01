
import { getBogotaDateString } from './date-utils.ts';

const CACHE_DURATION_HOURS = 2;

export async function checkCache(supabaseClient: any, flightNumber: string) {
  const cacheExpiry = new Date();
  cacheExpiry.setHours(cacheExpiry.getHours() - CACHE_DURATION_HOURS);
  
  const { data, error } = await supabaseClient
    .from('flight_api_cache')
    .select('*')
    .eq('flight_number', flightNumber)
    .gte('created_at', cacheExpiry.toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  
  if (error || !data) return null;
  
  try {
    return JSON.parse(data.api_response);
  } catch {
    return null;
  }
}

export async function saveToCache(supabaseClient: any, flightNumber: string, apiData: any) {
  const today = getBogotaDateString();
  await supabaseClient
    .from('flight_api_cache')
    .insert({
      flight_number: flightNumber,
      api_response: JSON.stringify(apiData),
      query_date: today
    });
}
