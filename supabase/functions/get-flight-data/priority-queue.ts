
import { getBogotaDateString } from './date-utils.ts';

export async function checkPriorityQueue(supabaseClient: any, currentPriority: number) {
  if (currentPriority >= 3) return false; // Alta prioridad, no postponer
  
  try {
    // Verificar si hay vuelos de mayor prioridad pendientes hoy
    const today = getBogotaDateString();
    
    // Contar paquetes por vuelo para determinar prioridad
    const { data: packageCounts } = await supabaseClient
      .from('packages')
      .select('flight_number', { count: 'exact' })
      .not('flight_number', 'is', null)
      .gte('created_at', today + 'T00:00:00.000Z');
    
    if (!packageCounts || packageCounts.length === 0) {
      return false;
    }
    
    // Agrupar por flight_number manualmente
    const flightCounts: { [key: string]: number } = {};
    packageCounts.forEach((pkg: any) => {
      if (pkg.flight_number) {
        flightCounts[pkg.flight_number] = (flightCounts[pkg.flight_number] || 0) + 1;
      }
    });
    
    // Verificar si hay algún vuelo con 3 o más paquetes (alta prioridad)
    const hasHighPriorityFlights = Object.values(flightCounts).some(count => count >= 3);
    
    return hasHighPriorityFlights && currentPriority < 3;
  } catch (error) {
    console.error('Error en checkPriorityQueue:', error);
    return false; // En caso de error, no postponer
  }
}
