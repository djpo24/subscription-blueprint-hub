import { FlightData } from '@/types/flight';
import { FlightStatusBadge } from './FlightStatusBadge';
import { FlightTimeDisplay } from './FlightTimeDisplay';
import { FlightRouteDisplay } from './FlightRouteDisplay';
import { FlightDetailsGrid } from './FlightDetailsGrid';
import { FlightLastUpdated } from './FlightLastUpdated';
import { FlightTerminalGateInfo } from './FlightTerminalGateInfo';
import { FlightAirlineInfo } from './FlightAirlineInfo';
import { FlightDataIndicators } from './FlightDataIndicators';
import { extractFlightApiData } from './FlightApiDataExtractor';
import { FlightApiDataSummary } from './FlightApiDataSummary';

interface FlightStatusDisplayProps {
  flight: FlightData;
}

export function FlightStatusDisplay({ flight }: FlightStatusDisplayProps) {
  console.log('FlightStatusDisplay datos COMPLETOS del vuelo:', {
    flight_number: flight.flight_number,
    scheduled_departure: flight.scheduled_departure,
    scheduled_arrival: flight.scheduled_arrival,
    actual_departure: flight.actual_departure,
    actual_arrival: flight.actual_arrival,
    status: flight.status,
    has_landed: flight.has_landed,
    airline: flight.airline,
    last_updated: flight.last_updated,
    api_departure_city: flight.api_departure_city,
    api_arrival_city: flight.api_arrival_city,
    api_departure_airport: flight.api_departure_airport,
    api_arrival_airport: flight.api_arrival_airport,
    api_departure_gate: flight.api_departure_gate,
    api_arrival_gate: flight.api_arrival_gate,
    api_departure_terminal: flight.api_departure_terminal,
    api_arrival_terminal: flight.api_arrival_terminal,
    api_aircraft: flight.api_aircraft,
    api_flight_status: flight.api_flight_status
  });

  // Extract API data using the helper
  const {
    departureTerminal,
    departureGate,
    arrivalTerminal,
    arrivalGate,
    departureCity,
    arrivalCity,
    departureAirportApi,
    arrivalAirportApi,
    aircraft,
    flightStatusApi
  } = extractFlightApiData(flight);

  // SIEMPRE priorizar horarios reales de la API cuando estén disponibles
  const departureTime = flight.actual_departure || flight.scheduled_departure;
  const arrivalTime = flight.actual_arrival || flight.scheduled_arrival;

  // Para las fechas de visualización, usar los horarios reales si están disponibles
  const departureDate = flight.actual_departure || flight.scheduled_departure;
  const arrivalDate = flight.actual_arrival || flight.scheduled_arrival;

  // Usar ciudades REALES de la API si están disponibles, sino usar aeropuertos originales
  const departureLocation = departureCity || flight.departure_airport;
  const arrivalLocation = arrivalCity || flight.arrival_airport;

  // Información de aeropuertos reales de la API
  const departureAirport = departureAirportApi || flight.departure_airport;
  const arrivalAirport = arrivalAirportApi || flight.arrival_airport;

  console.log('🎯 Datos de visualización FINALES (horarios REALES de API):', {
    departureTime,
    arrivalTime,
    departureLocation,
    arrivalLocation,
    departureAirport,
    arrivalAirport,
    status: flight.status,
    has_landed: flight.has_landed,
    actual_departure: flight.actual_departure,
    actual_arrival: flight.actual_arrival,
    departureTerminal,
    departureGate,
    arrivalTerminal,
    arrivalGate
  });

  return (
    <div className="space-y-4">
      {/* Resumen de datos REALES de la API */}
      <FlightApiDataSummary flight={flight} />
      
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        {/* Header con hora de llegada y destino */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <FlightTimeDisplay 
                dateTime={arrivalTime} 
                className="text-sm text-gray-600"
              />
              {flight.actual_arrival && (
                <span className="text-xs text-green-600 font-medium">
                  (Hora Real API)
                </span>
              )}
            </div>
            <span className="text-sm text-gray-600">
              a {arrivalLocation}
              {arrivalCity && (
                <span className="text-xs text-blue-600 ml-1">(Ciudad Real API)</span>
              )}
            </span>
          </div>
          <FlightStatusBadge 
            status={flight.status} 
            hasLanded={flight.has_landed} 
          />
        </div>

        {/* Terminal and Gate Information */}
        <FlightTerminalGateInfo
          departureTerminal={departureTerminal}
          departureGate={departureGate}
          arrivalTerminal={arrivalTerminal}
          arrivalGate={arrivalGate}
          departureAirport={departureAirport}
          arrivalAirport={arrivalAirport}
        />

        {/* Airline and Flight Information */}
        <FlightAirlineInfo
          flight={flight}
          departureCity={departureCity}
          arrivalCity={arrivalCity}
          aircraft={aircraft}
          flightStatusApi={flightStatusApi}
        />

        {/* Ruta con línea de conexión */}
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <FlightRouteDisplay 
            departureAirport={departureLocation}
            arrivalAirport={arrivalLocation}
            scheduledDeparture={flight.scheduled_departure}
            scheduledArrival={flight.scheduled_arrival}
          />

          {/* Información detallada con indicadores de datos reales */}
          <FlightDetailsGrid 
            departureAirport={flight.departure_airport}
            arrivalAirport={flight.arrival_airport}
            departureTime={departureTime}
            arrivalTime={arrivalTime}
            departureDate={departureDate}
            arrivalDate={arrivalDate}
            actualDeparture={flight.actual_departure}
            actualArrival={flight.actual_arrival}
            scheduledDeparture={flight.scheduled_departure}
            scheduledArrival={flight.scheduled_arrival}
            apiDepartureCity={departureCity}
            apiArrivalCity={arrivalCity}
            apiDepartureAirport={departureAirportApi}
            apiArrivalAirport={arrivalAirportApi}
            apiDepartureGate={departureGate}
            apiArrivalGate={arrivalGate}
            apiDepartureTerminal={departureTerminal}
            apiArrivalTerminal={arrivalTerminal}
          />
        </div>

        {/* Footer con última actualización y fuente de datos */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <FlightLastUpdated lastUpdated={flight.last_updated} />
          <FlightDataIndicators
            flight={flight}
            departureCity={departureCity}
            arrivalCity={arrivalCity}
            departureGate={departureGate}
            arrivalGate={arrivalGate}
          />
        </div>
      </div>
    </div>
  );
}
