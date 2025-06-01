
import type { FlightApiResponse } from './types.ts';

export function processFlightData(flightData: any): any {
  console.log('✅ Datos REALES completos del vuelo obtenidos de API:', {
    flight_status: flightData.flight_status,
    airline: flightData.airline?.name,
    aircraft: flightData.aircraft?.registration,
    departure: {
      airport: flightData.departure?.airport,
      iata: flightData.departure?.iata,
      icao: flightData.departure?.icao,
      terminal: flightData.departure?.terminal,
      gate: flightData.departure?.gate,
      scheduled: flightData.departure?.scheduled,
      actual: flightData.departure?.actual,
      timezone: flightData.departure?.timezone
    },
    arrival: {
      airport: flightData.arrival?.airport,
      iata: flightData.arrival?.iata,
      icao: flightData.arrival?.icao,
      terminal: flightData.arrival?.terminal,
      gate: flightData.arrival?.gate,
      scheduled: flightData.arrival?.scheduled,
      actual: flightData.arrival?.actual,
      timezone: flightData.arrival?.timezone
    }
  });

  // Capturar TODOS los datos disponibles de la API sin modificaciones
  flightData._fallback = false;
  flightData._source = 'aviationstack_api';
  
  // Extraer TODA la información completa de la API y agregarla al objeto
  flightData.api_departure_airport = flightData.departure?.airport || null;
  flightData.api_arrival_airport = flightData.arrival?.airport || null;
  flightData.api_departure_city = flightData.departure?.airport || null; // La API a veces pone ciudad en el campo airport
  flightData.api_arrival_city = flightData.arrival?.airport || null;
  flightData.api_departure_gate = flightData.departure?.gate || null;
  flightData.api_arrival_gate = flightData.arrival?.gate || null;
  flightData.api_departure_terminal = flightData.departure?.terminal || null;
  flightData.api_arrival_terminal = flightData.arrival?.terminal || null;
  flightData.api_aircraft = flightData.aircraft?.registration || flightData.aircraft?.iata || null;
  flightData.api_flight_status = flightData.flight_status || null;
  flightData.api_departure_timezone = flightData.departure?.timezone || null;
  flightData.api_arrival_timezone = flightData.arrival?.timezone || null;
  flightData.api_departure_iata = flightData.departure?.iata || null;
  flightData.api_arrival_iata = flightData.arrival?.iata || null;
  flightData.api_departure_icao = flightData.departure?.icao || null;
  flightData.api_arrival_icao = flightData.arrival?.icao || null;
  flightData.api_airline_name = flightData.airline?.name || null;
  flightData.api_airline_iata = flightData.airline?.iata || null;
  flightData.api_airline_icao = flightData.airline?.icao || null;
  flightData.api_aircraft_registration = flightData.aircraft?.registration || null;
  flightData.api_aircraft_iata = flightData.aircraft?.iata || null;
  
  // Crear una copia segura de los datos en bruto SIN referencias circulares
  const safeRawData = {
    flight_status: flightData.flight_status,
    airline: flightData.airline,
    aircraft: flightData.aircraft,
    departure: flightData.departure,
    arrival: flightData.arrival,
    flight: flightData.flight,
    flight_date: flightData.flight_date,
    flight_iata: flightData.flight_iata,
    flight_icao: flightData.flight_icao
  };
  
  // Guardar datos en bruto de forma segura (sin referencias circulares)
  flightData.api_raw_data = safeRawData;

  console.log('🎯 Datos COMPLETOS extraídos y agregados de la API:', {
    api_departure_city: flightData.api_departure_city,
    api_arrival_city: flightData.api_arrival_city,
    api_departure_airport: flightData.api_departure_airport,
    api_arrival_airport: flightData.api_arrival_airport,
    api_departure_gate: flightData.api_departure_gate,
    api_arrival_gate: flightData.api_arrival_gate,
    api_departure_terminal: flightData.api_departure_terminal,
    api_arrival_terminal: flightData.api_arrival_terminal,
    api_aircraft: flightData.api_aircraft,
    api_flight_status: flightData.api_flight_status,
    api_airline_name: flightData.api_airline_name,
    departure_scheduled: flightData.departure?.scheduled,
    departure_actual: flightData.departure?.actual,
    arrival_scheduled: flightData.arrival?.scheduled,
    arrival_actual: flightData.arrival?.actual,
    raw_data_saved: !!flightData.api_raw_data
  });

  return flightData;
}
