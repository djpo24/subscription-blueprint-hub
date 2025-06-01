
import { FlightData } from '@/types/flight';

interface FlightAirlineInfoProps {
  flight: FlightData;
  departureCity: string | null;
  arrivalCity: string | null;
  aircraft: string | null;
  flightStatusApi: string | null;
}

export function FlightAirlineInfo({
  flight,
  departureCity,
  arrivalCity,
  aircraft,
  flightStatusApi
}: FlightAirlineInfoProps) {
  return (
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
  );
}
