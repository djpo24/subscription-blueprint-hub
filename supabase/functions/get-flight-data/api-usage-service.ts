
import { getBogotaDate, getBogotaDateString } from './date-utils.ts';

const MAX_DAILY_QUERIES = 4;

export async function getDailyApiUsage(supabaseClient: any) {
  const today = getBogotaDateString();
  
  const { data, error } = await supabaseClient
    .from('flight_api_usage')
    .select('*', { count: 'exact' })
    .eq('query_date', today);
  
  return data?.length || 0;
}

export async function recordApiUsage(supabaseClient: any, flightNumber: string) {
  const today = getBogotaDateString();
  const bogotaTime = getBogotaDate();
  
  await supabaseClient
    .from('flight_api_usage')
    .insert({
      flight_number: flightNumber,
      query_date: today,
      query_time: bogotaTime.toISOString()
    });
}

export function hasReachedDailyLimit(dailyUsage: number): boolean {
  return dailyUsage >= MAX_DAILY_QUERIES;
}

export { MAX_DAILY_QUERIES };
