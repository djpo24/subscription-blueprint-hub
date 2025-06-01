
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
  console.log('FlightStatusDisplay flight data:', {
    flight_number: flight.flight_number,
    scheduled_departure: flight.scheduled_departure,
    scheduled_arrival: flight.scheduled_arrival,
    actual_departure: flight.actual_departure,
    actual_arrival: flight.actual_arrival,
    status: flight.status,
    has_landed: flight.has_landed
  });

  // Mostrar hora real si está disponible, sino la programada
  const departureTime = flight.actual_departure || flight.scheduled_departure;
  const arrivalTime = flight.actual_arrival || flight.scheduled_arrival;

  // Para las fechas, usar las fechas reales si están disponibles, sino las programadas
  const departureDate = flight.actual_departure || flight.scheduled_departure;
  const arrivalDate = flight.actual_arrival || flight.scheduled_arrival;

  console.log('Fechas finales para mostrar:', {
    departureTime,
    arrivalTime,
    departureDate,
    arrivalDate,
    status: flight.status,
    has_landed: flight.has_landed
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
            a {flight.arrival_airport}
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
        />

        {/* Información detallada */}
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
        />
      </div>

      {/* Footer con última actualización */}
      <FlightLastUpdated lastUpdated={flight.last_updated} />
    </div>
  );
}
