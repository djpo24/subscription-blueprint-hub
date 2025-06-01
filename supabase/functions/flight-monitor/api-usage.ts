
export async function getDailyApiUsage(supabaseClient: any): Promise<number> {
  const today = new Date().toISOString().split('T')[0];
  
  const { data, error } = await supabaseClient
    .from('flight_api_usage')
    .select('*', { count: 'exact' })
    .eq('query_date', today);
  
  return data?.length || 0;
}
