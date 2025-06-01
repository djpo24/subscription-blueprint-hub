
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
  console.log('FlightStatusDisplay datos del vuelo:', {
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
    api_arrival_city: flight.api_arrival_city
  });

  // Priorizar SIEMPRE los horarios reales cuando estén disponibles
  const departureTime = flight.actual_departure || flight.scheduled_departure;
  const arrivalTime = flight.actual_arrival || flight.scheduled_arrival;

  // Para las fechas de visualización, usar los horarios reales si están disponibles
  const departureDate = flight.actual_departure || flight.scheduled_departure;
  const arrivalDate = flight.actual_arrival || flight.scheduled_arrival;

  // Usar ciudades reales de la API si están disponibles
  const departureAirport = flight.api_departure_city || flight.departure_airport;
  const arrivalAirport = flight.api_arrival_city || flight.arrival_airport;

  // Determinar si los horarios son reales o programados para mostrar indicadores
  const hasDepartureChanged = flight.actual_departure && flight.actual_departure !== flight.scheduled_departure;
  const hasArrivalChanged = flight.actual_arrival && flight.actual_arrival !== flight.scheduled_arrival;

  console.log('Datos de visualización actualizados:', {
    departureTime,
    arrivalTime,
    departureAirport,
    arrivalAirport,
    hasDepartureChanged,
    hasArrivalChanged,
    status: flight.status,
    has_landed: flight.has_landed,
    actual_departure: flight.actual_departure,
    actual_arrival: flight.actual_arrival
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
                (Real)
              </span>
            )}
          </div>
          <span className="text-sm text-gray-600">
            a {arrivalAirport}
            {flight.api_arrival_city && (
              <span className="text-xs text-blue-600 ml-1">(API)</span>
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
        <div className="flex items-center gap-2">
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
              Ciudades de API
            </span>
          )}
        </div>
      </div>

      {/* Ruta con línea de conexión */}
      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <FlightRouteDisplay 
          departureAirport={departureAirport}
          arrivalAirport={arrivalAirport}
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
        />
      </div>

      {/* Footer con última actualización y fuente de datos */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <FlightLastUpdated lastUpdated={flight.last_updated} />
        <div className="flex items-center gap-3">
          {(flight.actual_departure || flight.actual_arrival) && (
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              Horarios de API en tiempo real
            </span>
          )}
          {(flight.api_departure_city || flight.api_arrival_city) && (
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              Ciudades reales de API
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
