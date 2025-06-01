
import { getBogotaDateString } from './date-utils.ts';

export function validateRequest(flightNumber: string): void {
  if (!flightNumber) {
    throw new Error('Flight number is required');
  }
}

export function isFlightToday(tripDate: string): boolean {
  const today = getBogotaDateString();
  const flightDate = new Date(tripDate).toISOString().split('T')[0];
  
  console.log('Comparando fechas - Hoy en Bogotá:', today, 'Fecha del vuelo:', flightDate);
  
  return flightDate === today;
}
