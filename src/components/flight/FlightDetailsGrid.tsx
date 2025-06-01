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
  apiDepartureCity?: string;
  apiArrivalCity?: string;
  apiDepartureAirport?: string;
  apiArrivalAirport?: string;
  apiDepartureGate?: string;
  apiArrivalGate?: string;
  apiDepartureTerminal?: string;
  apiArrivalTerminal?: string;
  apiDepartureIata?: string;
  apiArrivalIata?: string;
  apiAirlineName?: string;
  apiAircraftRegistration?: string;
  apiFlightStatus?: string;
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
  scheduledArrival,
  apiDepartureCity,
  apiArrivalCity,
  apiDepartureAirport,
  apiArrivalAirport,
  apiDepartureGate,
  apiArrivalGate,
  apiDepartureTerminal,
  apiArrivalTerminal,
  apiDepartureIata,
  apiArrivalIata,
  apiAirlineName,
  apiAircraftRegistration,
  apiFlightStatus
}: FlightDetailsGridProps) {
  console.log('FlightDetailsGrid - TODOS los datos de la API:', {
    apiDepartureCity,
    apiArrivalCity,
    apiDepartureIata,
    apiArrivalIata,
    apiDepartureGate,
    apiArrivalGate,
    apiDepartureTerminal,
    apiArrivalTerminal,
    apiAirlineName,
    apiAircraftRegistration,
    apiFlightStatus
  });

  // Usar información completa de la API
  const displayDepartureInfo = {
    city: apiDepartureCity || departureAirport,
    airport: apiDepartureAirport || departureAirport,
    iata: apiDepartureIata,
    gate: apiDepartureGate,
    terminal: apiDepartureTerminal
  };
  const displayArrivalInfo = {
    city: apiArrivalCity || arrivalAirport,
    airport: apiArrivalAirport || arrivalAirport,
    iata: apiArrivalIata,
    gate: apiArrivalGate,
    terminal: apiArrivalTerminal
  };

  // Calcular diferencias de tiempo
  const calculateTimeDifference = (scheduled: string | null, actual: string | null) => {
    if (!scheduled || !actual) return null;
    try {
      const scheduledTime = new Date(scheduled);
      const actualTime = new Date(actual);
      const diffMinutes = Math.round((actualTime.getTime() - scheduledTime.getTime()) / (1000 * 60));
      return {
        minutes: Math.abs(diffMinutes),
        isDelay: diffMinutes > 0,
        isEarly: diffMinutes < 0
      };
    } catch {
      return null;
    }
  };
  const departureDiff = calculateTimeDifference(scheduledDeparture, actualDeparture);
  const arrivalDiff = calculateTimeDifference(scheduledArrival, actualArrival);
  return <div className="space-y-6">
      {/* Información de estado y aerolínea */}
      {(apiFlightStatus || apiAirlineName || apiAircraftRegistration) && <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-blue-50 rounded-lg">
          {apiFlightStatus && <div>
              <div className="text-sm text-gray-500">Estado del Vuelo</div>
              <div className="font-medium capitalize">{apiFlightStatus}</div>
            </div>}
          {apiAirlineName && <div>
              <div className="text-sm text-gray-500">Aerolínea</div>
              <div className="font-medium">{apiAirlineName}</div>
            </div>}
          {apiAircraftRegistration && <div>
              <div className="text-sm text-gray-500">Aeronave</div>
              <div className="font-medium">{apiAircraftRegistration}</div>
            </div>}
        </div>}

      {/* Información de aeropuertos */}
      <div className="grid grid-cols-2 gap-6">
        {/* Salida */}
        <div className="space-y-3">
          <div className="border-b pb-2">
            <h3 className="font-semibold text-lg">Salida</h3>
            
          </div>

          <div>
            <div className="text-sm text-gray-500">Fecha</div>
            <div className="font-medium">
              <FlightDateDisplay dateTime={departureDate} />
            </div>
          </div>

          <div>
            <div className="text-sm text-gray-500">
              {actualDeparture ? 'Hora Real de Salida' : 'Hora Programada'}
            </div>
            <div className={`text-2xl font-bold ${actualDeparture ? 'text-green-600' : 'text-gray-900'}`}>
              <FlightTimeDisplay dateTime={actualDeparture || departureTime} />
            </div>
            {scheduledDeparture && actualDeparture && scheduledDeparture !== actualDeparture && <div className="flex flex-col mt-1">
                <div className="text-sm text-gray-500 line-through">
                  Programado: <FlightTimeDisplay dateTime={scheduledDeparture} />
                </div>
                {departureDiff && <div className={`text-xs ${departureDiff.isDelay ? 'text-red-500' : 'text-green-500'}`}>
                    {departureDiff.isDelay ? `+${departureDiff.minutes} min retraso` : `-${departureDiff.minutes} min adelanto`}
                  </div>}
              </div>}
          </div>

          {(displayDepartureInfo.gate || displayDepartureInfo.terminal) && <div>
              <div className="text-sm text-gray-500">Terminal y Puerta</div>
              <div className="font-medium">
                {displayDepartureInfo.terminal && `Terminal ${displayDepartureInfo.terminal}`}
                {displayDepartureInfo.terminal && displayDepartureInfo.gate && ' - '}
                {displayDepartureInfo.gate && `Puerta ${displayDepartureInfo.gate}`}
              </div>
            </div>}
        </div>

        {/* Llegada */}
        <div className="space-y-3">
          <div className="border-b pb-2">
            <h3 className="font-semibold text-lg">Llegada</h3>
            <div className="text-sm text-gray-600">
              {displayArrivalInfo.iata && <span className="font-mono text-lg">{displayArrivalInfo.iata}</span>}
              {displayArrivalInfo.city && <div className="text-gray-700">{displayArrivalInfo.city}</div>}
            </div>
          </div>

          <div>
            <div className="text-sm text-gray-500">Fecha</div>
            <div className="font-medium">
              <FlightDateDisplay dateTime={arrivalDate} />
            </div>
          </div>

          <div>
            <div className="text-sm text-gray-500">
              {actualArrival ? 'Hora Real de Llegada' : 'Hora Programada'}
            </div>
            <div className={`text-2xl font-bold ${actualArrival ? 'text-green-600' : 'text-gray-900'}`}>
              <FlightTimeDisplay dateTime={actualArrival || arrivalTime} />
            </div>
            {scheduledArrival && actualArrival && scheduledArrival !== actualArrival && <div className="flex flex-col mt-1">
                <div className="text-sm text-gray-500 line-through">
                  Programado: <FlightTimeDisplay dateTime={scheduledArrival} />
                </div>
                {arrivalDiff && <div className={`text-xs ${arrivalDiff.isDelay ? 'text-red-500' : 'text-green-500'}`}>
                    {arrivalDiff.isDelay ? `+${arrivalDiff.minutes} min retraso` : `-${arrivalDiff.minutes} min adelanto`}
                  </div>}
              </div>}
          </div>

          {(displayArrivalInfo.gate || displayArrivalInfo.terminal) && <div>
              <div className="text-sm text-gray-500">Terminal y Puerta</div>
              <div className="font-medium">
                {displayArrivalInfo.terminal && `Terminal ${displayArrivalInfo.terminal}`}
                {displayArrivalInfo.terminal && displayArrivalInfo.gate && ' - '}
                {displayArrivalInfo.gate && `Puerta ${displayArrivalInfo.gate}`}
              </div>
            </div>}
        </div>
      </div>
    </div>;
}