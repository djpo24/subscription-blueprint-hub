
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

  // Mostrar hora real si está disponible, sino la programada
  const departureTime = flight.actual_departure || flight.scheduled_departure;
  const arrivalTime = flight.actual_arrival || flight.scheduled_arrival;

  // Para las fechas, usar las fechas programadas principalmente
  const departureDate = flight.scheduled_departure || flight.actual_departure;
  const arrivalDate = flight.scheduled_arrival || flight.actual_arrival;

  // Usar información de la API si está disponible
  const departureLocation = flight.api_departure_city || flight.departure_airport;
  const arrivalLocation = flight.api_arrival_city || flight.arrival_airport;
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
      {/* Header con hora y destino */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <FlightTimeDisplay 
            dateTime={arrivalTime} 
            className="text-sm text-gray-600"
          />
          <span className="text-sm text-gray-600">
            a {arrivalLocation}
          </span>
        </div>
        <FlightStatusBadge 
          status={flight.status} 
          hasLanded={flight.has_landed} 
        />
      </div>

      {/* Número de vuelo */}
      <div className="mb-6">
        <span className="text-2xl font-bold text-gray-900">
          {flight.airline} {flight.flight_number}
        </span>
      </div>

      {/* Ruta con línea de conexión */}
      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <FlightRouteDisplay 
          departureAirport={flight.departure_airport}
          arrivalAirport={flight.arrival_airport}
          scheduledDeparture={flight.scheduled_departure}
          scheduledArrival={flight.scheduled_arrival}
          apiDepartureCity={flight.api_departure_city || undefined}
          apiArrivalCity={flight.api_arrival_city || undefined}
        />

        {/* Información detallada */}
        <FlightDetailsGrid 
          departureAirport={departureAirport}
          arrivalAirport={arrivalAirport}
          departureTime={departureTime}
          arrivalTime={arrivalTime}
          departureDate={departureDate}
          arrivalDate={arrivalDate}
          actualDeparture={flight.actual_departure}
          actualArrival={flight.actual_arrival}
          scheduledDeparture={flight.scheduled_departure}
          scheduledArrival={flight.scheduled_arrival}
          apiDepartureCity={flight.api_departure_city || undefined}
          apiArrivalCity={flight.api_arrival_city || undefined}
          apiDepartureAirport={flight.api_departure_airport || undefined}
          apiArrivalAirport={flight.api_arrival_airport || undefined}
          apiDepartureGate={flight.api_departure_gate || undefined}
          apiArrivalGate={flight.api_arrival_gate || undefined}
          apiDepartureTerminal={flight.api_departure_terminal || undefined}
          apiArrivalTerminal={flight.api_arrival_terminal || undefined}
        />
      </div>

      {/* Footer con última actualización */}
      <FlightLastUpdated lastUpdated={flight.last_updated} />
    </div>
  );
}
