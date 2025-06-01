
import type { FlightApiResponse } from './types.ts';

export async function fetchFlightDataFromAPI(flightNumber: string, apiKey: string): Promise<FlightApiResponse> {
  console.log('✈️ Realizando consulta REAL a AviationStack API para vuelo:', flightNumber);
  const apiUrl = `http://api.aviationstack.com/v1/flights?access_key=${apiKey}&flight_iata=${flightNumber}&limit=1`;
  
  const response = await fetch(apiUrl);
  const data = await response.json();

  console.log('Respuesta de AviationStack API:', {
    data: data?.data?.length || 0,
    error: data?.error || null,
    flight_status: data?.data?.[0]?.flight_status || 'no data'
  });

  return data;
}
