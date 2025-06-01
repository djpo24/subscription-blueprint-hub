
import { FlightApiResponse } from '@/services/flightDataService';
import { FlightStatusResult } from '@/utils/flightStatusCalculator';

export function mapFlightDataForDatabase(
  flightNumber: string,
  origin: string,
  destination: string,
  flightStatusResult: FlightStatusResult,
  flightDataFromAPI: FlightApiResponse | null
) {
  console.log('🎯 MAPPER: Iniciando mapeo de TODOS los datos de la API para la base de datos...');
  
  // Usar datos de aeropuerto de la API si están disponibles, sino usar los del viaje
  const departureAirport = flightDataFromAPI?.api_departure_airport || origin;
  const arrivalAirport = flightDataFromAPI?.api_arrival_airport || destination;

  // Preparar TODOS los datos del vuelo incluyendo TODA la información de la API
  const flightData = {
    flight_number: flightNumber,
    departure_airport: departureAirport,
    arrival_airport: arrivalAirport,
    scheduled_departure: flightStatusResult.scheduledDeparture.toISOString(),
    scheduled_arrival: flightStatusResult.scheduledArrival.toISOString(),
    actual_departure: flightStatusResult.actualDeparture,
    actual_arrival: flightStatusResult.actualArrival,
    status: flightStatusResult.status,
    has_landed: flightStatusResult.hasLanded,
    notification_sent: false,
    airline: flightDataFromAPI?.api_airline_name || 'Avianca',
    // Incluir TODA la información COMPLETA de la API - VERIFICACIÓN EXHAUSTIVA
    ...(flightDataFromAPI && {
      // Información de aeropuertos completa
      api_departure_airport: flightDataFromAPI.api_departure_airport,
      api_arrival_airport: flightDataFromAPI.api_arrival_airport,
      api_departure_city: flightDataFromAPI.api_departure_city,
      api_arrival_city: flightDataFromAPI.api_arrival_city,
      
      // Información de terminales y puertas
      api_departure_gate: flightDataFromAPI.api_departure_gate,
      api_arrival_gate: flightDataFromAPI.api_arrival_gate,
      api_departure_terminal: flightDataFromAPI.api_departure_terminal,
      api_arrival_terminal: flightDataFromAPI.api_arrival_terminal,
      
      // Información de aeronave
      api_aircraft: flightDataFromAPI.api_aircraft,
      api_aircraft_registration: flightDataFromAPI.api_aircraft_registration,
      api_aircraft_iata: flightDataFromAPI.api_aircraft_iata,
      
      // Estado del vuelo desde la API
      api_flight_status: flightDataFromAPI.api_flight_status,
      
      // Zonas horarias
      api_departure_timezone: flightDataFromAPI.api_departure_timezone,
      api_arrival_timezone: flightDataFromAPI.api_arrival_timezone,
      
      // Códigos IATA
      api_departure_iata: flightDataFromAPI.api_departure_iata,
      api_arrival_iata: flightDataFromAPI.api_arrival_iata,
      
      // Códigos ICAO
      api_departure_icao: flightDataFromAPI.api_departure_icao,
      api_arrival_icao: flightDataFromAPI.api_arrival_icao,
      
      // Información de aerolínea completa
      api_airline_name: flightDataFromAPI.api_airline_name,
      api_airline_iata: flightDataFromAPI.api_airline_iata,
      api_airline_icao: flightDataFromAPI.api_airline_icao,
      
      // Datos completos en bruto para referencia futura
      api_raw_data: flightDataFromAPI.api_raw_data
    })
  };

  console.log('🎯 MAPPER: Datos COMPLETOS mapeados para insertar en BD:', {
    basic_info: {
      flight_number: flightData.flight_number,
      departure_airport: flightData.departure_airport,
      arrival_airport: flightData.arrival_airport,
      status: flightData.status,
      has_landed: flightData.has_landed
    },
    api_airports: {
      api_departure_airport: flightData.api_departure_airport,
      api_arrival_airport: flightData.api_arrival_airport,
      api_departure_city: flightData.api_departure_city,
      api_arrival_city: flightData.api_arrival_city
    },
    api_terminals_gates: {
      api_departure_terminal: flightData.api_departure_terminal,
      api_arrival_terminal: flightData.api_arrival_terminal,
      api_departure_gate: flightData.api_departure_gate,
      api_arrival_gate: flightData.api_arrival_gate
    },
    api_aircraft_info: {
      api_aircraft: flightData.api_aircraft,
      api_aircraft_registration: flightData.api_aircraft_registration,
      api_aircraft_iata: flightData.api_aircraft_iata
    },
    api_airline_info: {
      api_airline_name: flightData.api_airline_name,
      api_airline_iata: flightData.api_airline_iata,
      api_airline_icao: flightData.api_airline_icao
    },
    api_codes: {
      api_departure_iata: flightData.api_departure_iata,
      api_arrival_iata: flightData.api_arrival_iata,
      api_departure_icao: flightData.api_departure_icao,
      api_arrival_icao: flightData.api_arrival_icao
    },
    api_timezones: {
      api_departure_timezone: flightData.api_departure_timezone,
      api_arrival_timezone: flightData.api_arrival_timezone
    },
    api_status: {
      api_flight_status: flightData.api_flight_status
    },
    raw_data_available: !!flightData.api_raw_data
  });

  console.log('✅ MAPPER: Mapeo completo finalizado - TODA la información de la API ha sido incluida');
  return flightData;
}
