
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
  apiArrivalTerminal
}: FlightDetailsGridProps) {
  
  console.log('FlightDetailsGrid - datos COMPLETOS recibidos:', {
    departureTime,
    arrivalTime,
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
    apiArrivalTerminal
  });

  // Usar información de la API si está disponible
  const displayDepartureInfo = {
    city: apiDepartureCity || departureAirport,
    airport: apiDepartureAirport || departureAirport,
    gate: apiDepartureGate,
    terminal: apiDepartureTerminal
  };

  const displayArrivalInfo = {
    city: apiArrivalCity || arrivalAirport,
    airport: apiArrivalAirport || arrivalAirport,
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

  console.log('🎯 FlightDetailsGrid - información FINAL a mostrar:', {
    displayDepartureTime: departureTime,
    displayArrivalTime: arrivalTime,
    displayDepartureInfo,
    displayArrivalInfo,
    departureDiff,
    arrivalDiff
  });

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Salida */}
      <div>
        <div className="text-sm text-gray-500 mb-1">
          Información del aeropuerto
        </div>
        <div className="font-medium">
          {displayDepartureInfo.airport} · <FlightDateDisplay dateTime={departureDate} />
        </div>
        {displayDepartureInfo.gate && (
          <div className="text-xs text-gray-500">
            Puerta: {displayDepartureInfo.gate}
            {displayDepartureInfo.terminal && ` - Terminal ${displayDepartureInfo.terminal}`}
          </div>
        )}
        <div className="text-sm text-gray-600 mt-2">
          {actualDeparture ? 'Salió' : 'Salida'}
        </div>
        <div className={`text-2xl font-bold ${actualDeparture ? 'text-green-600' : 'text-gray-900'}`}>
          <FlightTimeDisplay dateTime={departureTime} />
        </div>
        {scheduledDeparture && actualDeparture && scheduledDeparture !== actualDeparture && (
          <div className="flex flex-col">
            <div className="text-sm text-gray-500 line-through">
              <FlightTimeDisplay dateTime={scheduledDeparture} />
            </div>
            {departureDiff && (
              <div className={`text-xs ${departureDiff.isDelay ? 'text-red-500' : 'text-green-500'}`}>
                {departureDiff.isDelay ? `+${departureDiff.minutes} min retraso` : `-${departureDiff.minutes} min adelanto`}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Llegada */}
      <div>
        <div className="text-sm text-gray-500 mb-1">
          Información del aeropuerto
        </div>
        <div className="font-medium">
          {displayArrivalInfo.airport} · <FlightDateDisplay dateTime={arrivalDate} />
        </div>
        {displayArrivalInfo.gate && (
          <div className="text-xs text-gray-500">
            Puerta: {displayArrivalInfo.gate}
            {displayArrivalInfo.terminal && ` - Terminal ${displayArrivalInfo.terminal}`}
          </div>
        )}
        <div className="text-sm text-gray-600 mt-2">
          {actualArrival ? 'Llegó' : 'Llegada'}
        </div>
        <div className={`text-2xl font-bold ${actualArrival ? 'text-green-600' : 'text-gray-900'}`}>
          <FlightTimeDisplay dateTime={arrivalTime} />
        </div>
        {scheduledArrival && actualArrival && scheduledArrival !== actualArrival && (
          <div className="flex flex-col">
            <div className="text-sm text-gray-500 line-through">
              <FlightTimeDisplay dateTime={scheduledArrival} />
            </div>
            {arrivalDiff && (
              <div className={`text-xs ${arrivalDiff.isDelay ? 'text-red-500' : 'text-green-500'}`}>
                {arrivalDiff.isDelay ? `+${arrivalDiff.minutes} min retraso` : `-${arrivalDiff.minutes} min adelanto`}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
