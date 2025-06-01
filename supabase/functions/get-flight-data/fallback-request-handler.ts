
import { generateFallbackData } from './fallback-generator.ts';
import { createErrorResponse } from './response-handler.ts';
import type { FallbackFlightData } from './types.ts';

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
