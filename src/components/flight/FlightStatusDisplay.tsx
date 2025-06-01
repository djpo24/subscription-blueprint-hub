
import { FlightData } from '@/types/flight';
import { FlightStatusBadge } from './FlightStatusBadge';
import { FlightTimeDisplay } from './FlightTimeDisplay';
import { FlightRouteDisplay } from './FlightRouteDisplay';
import { FlightDetailsGrid } from './FlightDetailsGrid';
import { FlightLastUpdated } from './FlightLastUpdated';

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

  // SIEMPRE priorizar horarios reales de la API cuando estén disponibles
  const departureTime = flight.actual_departure || flight.scheduled_departure;
  const arrivalTime = flight.actual_arrival || flight.scheduled_arrival;

  // Para las fechas de visualización, usar los horarios reales si están disponibles
  const departureDate = flight.actual_departure || flight.scheduled_departure;
  const arrivalDate = flight.actual_arrival || flight.scheduled_arrival;

  // Usar ciudades REALES de la API si están disponibles, sino usar aeropuertos originales
  const departureLocation = flight.api_departure_city || flight.departure_airport;
  const arrivalLocation = flight.api_arrival_city || flight.arrival_airport;

  // Información de aeropuertos reales de la API
  const departureAirport = flight.api_departure_airport || flight.departure_airport;
  const arrivalAirport = flight.api_arrival_airport || flight.arrival_airport;

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
    api_departure_gate: flight.api_departure_gate,
    api_arrival_gate: flight.api_arrival_gate
  });

  return (
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
            {flight.api_arrival_city && (
              <span className="text-xs text-blue-600 ml-1">(Ciudad Real API)</span>
            )}
          </span>
        </div>
        <FlightStatusBadge 
          status={flight.status} 
          hasLanded={flight.has_landed} 
        />
      </div>

      {/* Información de la aerolínea y número de vuelo */}
      <div className="mb-6">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-2xl font-bold text-gray-900">
            {flight.airline} {flight.flight_number}
          </span>
          {flight.has_landed && (
            <span className="text-sm text-green-600 bg-green-50 px-2 py-1 rounded">
              Datos reales confirmados
            </span>
          )}
          {(flight.api_departure_city || flight.api_arrival_city) && (
            <span className="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded">
              Ciudades de API Real
            </span>
          )}
          {flight.api_aircraft && (
            <span className="text-sm text-purple-600 bg-purple-50 px-2 py-1 rounded">
              Aeronave: {flight.api_aircraft}
            </span>
          )}
          {flight.api_flight_status && (
            <span className="text-sm text-orange-600 bg-orange-50 px-2 py-1 rounded">
              Estado API: {flight.api_flight_status}
            </span>
          )}
        </div>
      </div>

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
          apiDepartureCity={flight.api_departure_city}
          apiArrivalCity={flight.api_arrival_city}
          apiDepartureAirport={flight.api_departure_airport}
          apiArrivalAirport={flight.api_arrival_airport}
          apiDepartureGate={flight.api_departure_gate}
          apiArrivalGate={flight.api_arrival_gate}
          apiDepartureTerminal={flight.api_departure_terminal}
          apiArrivalTerminal={flight.api_arrival_terminal}
        />
      </div>

      {/* Footer con última actualización y fuente de datos */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <FlightLastUpdated lastUpdated={flight.last_updated} />
        <div className="flex items-center gap-3 flex-wrap">
          {(flight.actual_departure || flight.actual_arrival) && (
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              Horarios REALES de API
            </span>
          )}
          {(flight.api_departure_city || flight.api_arrival_city) && (
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              Ciudades REALES de API
            </span>
          )}
          {(flight.api_departure_gate || flight.api_arrival_gate) && (
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
              Gates de API
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
