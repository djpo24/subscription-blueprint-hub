
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

  // Helper function to extract value from API objects
  const getApiValue = (apiField: any): string | null => {
    if (!apiField) return null;
    if (typeof apiField === 'string') return apiField;
    if (typeof apiField === 'object' && apiField.value && apiField.value !== 'undefined') {
      return apiField.value;
    }
    return null;
  };

  // Extract real values from API fields
  const departureTerminal = getApiValue(flight.api_departure_terminal);
  const departureGate = getApiValue(flight.api_departure_gate);
  const arrivalTerminal = getApiValue(flight.api_arrival_terminal);
  const arrivalGate = getApiValue(flight.api_arrival_gate);
  const departureCity = getApiValue(flight.api_departure_city);
  const arrivalCity = getApiValue(flight.api_arrival_city);
  const departureAirportApi = getApiValue(flight.api_departure_airport);
  const arrivalAirportApi = getApiValue(flight.api_arrival_airport);
  const aircraft = getApiValue(flight.api_aircraft);
  const flightStatusApi = getApiValue(flight.api_flight_status);

  console.log('🔍 Valores extraídos de la API:', {
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
  });

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
            {departureCity && (
              <span className="text-xs text-blue-600 ml-1">(Ciudad Real API)</span>
            )}
          </span>
        </div>
        <FlightStatusBadge 
          status={flight.status} 
          hasLanded={flight.has_landed} 
        />
      </div>

      {/* Información de Terminal y Puerta de Embarque */}
      {(departureTerminal || departureGate || arrivalTerminal || arrivalGate) && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Información de Salida */}
            {(departureTerminal || departureGate) && (
              <div>
                <div className="text-sm font-medium text-blue-700 mb-1">
                  🛫 Salida - {departureAirport}
                </div>
                <div className="space-y-1">
                  {departureTerminal && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-600">Terminal:</span>
                      <span className="text-sm font-bold text-blue-700">
                        {departureTerminal}
                      </span>
                    </div>
                  )}
                  {departureGate && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-600">Puerta:</span>
                      <span className="text-sm font-bold text-blue-700">
                        {departureGate}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Información de Llegada */}
            {(arrivalTerminal || arrivalGate) && (
              <div>
                <div className="text-sm font-medium text-green-700 mb-1">
                  🛬 Llegada - {arrivalAirport}
                </div>
                <div className="space-y-1">
                  {arrivalTerminal && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-600">Terminal:</span>
                      <span className="text-sm font-bold text-green-700">
                        {arrivalTerminal}
                      </span>
                    </div>
                  )}
                  {arrivalGate && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-600">Puerta:</span>
                      <span className="text-sm font-bold text-green-700">
                        {arrivalGate}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

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
          {(departureCity || arrivalCity) && (
            <span className="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded">
              Ciudades de API Real
            </span>
          )}
          {aircraft && (
            <span className="text-sm text-purple-600 bg-purple-50 px-2 py-1 rounded">
              Aeronave: {aircraft}
            </span>
          )}
          {flightStatusApi && (
            <span className="text-sm text-orange-600 bg-orange-50 px-2 py-1 rounded">
              Estado API: {flightStatusApi}
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
        <div className="flex items-center gap-3 flex-wrap">
          {(flight.actual_departure || flight.actual_arrival) && (
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              Horarios REALES de API
            </span>
          )}
          {(departureCity || arrivalCity) && (
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              Ciudades REALES de API
            </span>
          )}
          {(departureGate || arrivalGate) && (
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
