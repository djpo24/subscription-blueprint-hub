
import { FlightApiResponse } from '@/services/flightDataService';
import { FlightStatusResult } from '@/utils/flightStatusCalculator';

export function mapFlightDataForDatabase(
  flightNumber: string,
  origin: string,
  destination: string,
  flightStatusResult: FlightStatusResult,
  flightDataFromAPI: FlightApiResponse | null
) {
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
    // Incluir TODA la información de la API
    ...(flightDataFromAPI && {
      api_departure_airport: flightDataFromAPI.api_departure_airport,
      api_arrival_airport: flightDataFromAPI.api_arrival_airport,
      api_departure_city: flightDataFromAPI.api_departure_city,
      api_arrival_city: flightDataFromAPI.api_arrival_city,
      api_departure_gate: flightDataFromAPI.api_departure_gate,
      api_arrival_gate: flightDataFromAPI.api_arrival_gate,
      api_departure_terminal: flightDataFromAPI.api_departure_terminal,
      api_arrival_terminal: flightDataFromAPI.api_arrival_terminal,
      api_aircraft: flightDataFromAPI.api_aircraft,
      api_flight_status: flightDataFromAPI.api_flight_status,
      api_departure_timezone: flightDataFromAPI.api_departure_timezone,
      api_arrival_timezone: flightDataFromAPI.api_arrival_timezone,
      api_departure_iata: flightDataFromAPI.api_departure_iata,
      api_arrival_iata: flightDataFromAPI.api_arrival_iata,
      api_departure_icao: flightDataFromAPI.api_departure_icao,
      api_arrival_icao: flightDataFromAPI.api_arrival_icao,
      api_airline_name: flightDataFromAPI.api_airline_name,
      api_airline_iata: flightDataFromAPI.api_airline_iata,
      api_airline_icao: flightDataFromAPI.api_airline_icao,
      api_aircraft_registration: flightDataFromAPI.api_aircraft_registration,
      api_aircraft_iata: flightDataFromAPI.api_aircraft_iata,
      api_raw_data: flightDataFromAPI.api_raw_data
    })
  };

  console.log('Creating flight with COMPLETE data:', flightData);
  return flightData;
}
