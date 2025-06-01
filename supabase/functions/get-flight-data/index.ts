
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { validateRequest } from './validation.ts';
import { handleFlightRequest, handleFallbackError } from './request-handler.ts';
import { createOptionsResponse, createCriticalErrorResponse } from './response-handler.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return createOptionsResponse();
  }

  try {
    const { flightNumber, tripDate, priority = 1 } = await req.json();
    
    validateRequest(flightNumber);

    return await handleFlightRequest(flightNumber, tripDate, priority);

  } catch (error) {
    console.error('💥 Error crítico en get-flight-data:', error);
    
    // En caso de error, intentar generar datos de fallback
    try {
      const { flightNumber, tripDate } = await req.json();
      return await handleFallbackError(flightNumber, tripDate);
    } catch {
      return createCriticalErrorResponse(error);
    }
  }
});
