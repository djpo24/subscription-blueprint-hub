
import { FlightTimeDisplay } from './FlightTimeDisplay';
import { FlightDateDisplay } from './FlightDateDisplay';

interface FlightDetailsGridProps {
  departureAirport: string;
  arrivalAirport: string;
  departureTime: string | null;
  arrivalTime: string | null;
  departureDate: string | null;
  arrivalDate: string | null;
  actualDeparture: string | null;
  actualArrival: string | null;
  scheduledDeparture: string | null;
  scheduledArrival: string | null;
}

export function FlightDetailsGrid({
  departureAirport,
  arrivalAirport,
  departureTime,
  arrivalTime,
  departureDate,
  arrivalDate,
  actualDeparture,
  actualArrival,
  scheduledDeparture,
  scheduledArrival
}: FlightDetailsGridProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Salida */}
      <div>
        <div className="text-sm text-gray-500 mb-1">
          Información del aeropuerto
        </div>
        <div className="font-medium">
          {departureAirport} · <FlightDateDisplay dateTime={departureDate} />
        </div>
        <div className="text-sm text-gray-600">
          {actualDeparture ? 'Salió' : 'Salida'}
        </div>
        <div className={`text-2xl font-bold ${actualDeparture ? 'text-green-600' : 'text-gray-900'}`}>
          <FlightTimeDisplay dateTime={departureTime} />
        </div>
        {scheduledDeparture && actualDeparture && scheduledDeparture !== actualDeparture && (
          <div className="text-sm text-gray-500 line-through">
            <FlightTimeDisplay dateTime={scheduledDeparture} />
          </div>
        )}
      </div>

      {/* Llegada */}
      <div>
        <div className="text-sm text-gray-500 mb-1">
          Información del aeropuerto
        </div>
        <div className="font-medium">
          {arrivalAirport} · <FlightDateDisplay dateTime={arrivalDate} />
        </div>
        <div className="text-sm text-gray-600">
          {actualArrival ? 'Llegó' : 'Llegada'}
        </div>
        <div className={`text-2xl font-bold ${actualArrival ? 'text-green-600' : 'text-gray-900'}`}>
          <FlightTimeDisplay dateTime={arrivalTime} />
        </div>
        {scheduledArrival && actualArrival && scheduledArrival !== actualArrival && (
          <div className="text-sm text-gray-500 line-through">
            <FlightTimeDisplay dateTime={scheduledArrival} />
          </div>
        )}
      </div>
    </div>
  );
}
