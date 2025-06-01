
import type { FallbackFlightData } from './types.ts';
import { corsHeaders } from './constants.ts';

export function createSuccessResponse(data: any): Response {
  return new Response(
    JSON.stringify(data),
    { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200 
    }
  );
}

export function createErrorResponse(fallbackData: FallbackFlightData): Response {
  return new Response(
    JSON.stringify(fallbackData),
    { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200 
    }
  );
}

export function createCriticalErrorResponse(error: any, details?: string): Response {
  return new Response(
    JSON.stringify({ 
      error: error.message,
      details: details || error.toString()
    }),
    { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500 
    }
  );
}

export function createOptionsResponse(): Response {
  return new Response('ok', { headers: corsHeaders });
}
