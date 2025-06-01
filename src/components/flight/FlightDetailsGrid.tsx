
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
  // Campos completos para mostrar datos reales de la API
  apiDepartureCity?: string | null;
  apiArrivalCity?: string | null;
  apiDepartureAirport?: string | null;
  apiArrivalAirport?: string | null;
  apiDepartureGate?: string | null;
  apiArrivalGate?: string | null;
  apiDepartureTerminal?: string | null;
  apiArrivalTerminal?: string | null;
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
  
  // Calcular diferencias de tiempo
  const calculateTimeDifference = (scheduled: string | null, actual: string | null) => {
    if (!scheduled || !actual) return null;
    
    const scheduledTime = new Date(scheduled);
    const actualTime = new Date(actual);
    const diffMinutes = Math.round((actualTime.getTime() - scheduledTime.getTime()) / (1000 * 60));
    
    if (Math.abs(diffMinutes) < 5) return null; // Diferencia insignificante
    
    return {
      minutes: Math.abs(diffMinutes),
      isDelay: diffMinutes > 0,
      isEarly: diffMinutes < 0
    };
  };

  const departureDiff = calculateTimeDifference(scheduledDeparture, actualDeparture);
  const arrivalDiff = calculateTimeDifference(scheduledArrival, actualArrival);

  // SIEMPRE priorizar horarios REALES de la API sin conversiones
  const displayDepartureTime = actualDeparture || departureTime;
  const displayArrivalTime = actualArrival || arrivalTime;

  // Mostrar información COMPLETA de aeropuertos de la API
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

  console.log('🎯 FlightDetailsGrid - información FINAL a mostrar:', {
    displayDepartureTime,
    displayArrivalTime,
    displayDepartureInfo,
    displayArrivalInfo,
    departureDiff,
    arrivalDiff
  });

  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Salida */}
      <div>
        <div className="text-sm text-gray-500 mb-1">
          Información de salida
        </div>
        <div className="font-medium mb-2 space-y-1">
          <div>{displayDepartureInfo.city} · <FlightDateDisplay dateTime={departureDate} /></div>
          {displayDepartureInfo.airport && displayDepartureInfo.airport !== displayDepartureInfo.city && (
            <div className="text-sm text-blue-600">Aeropuerto: {displayDepartureInfo.airport}</div>
          )}
          {displayDepartureInfo.terminal && (
            <div className="text-sm text-purple-600">Terminal: {displayDepartureInfo.terminal}</div>
          )}
          {displayDepartureInfo.gate && (
            <div className="text-sm text-orange-600">Gate: {displayDepartureInfo.gate}</div>
          )}
        </div>
        <div className="text-sm text-gray-600 mb-1">
          {actualDeparture ? 'Salida Real (API)' : 'Salida Programada'}
        </div>
        <div className={`text-2xl font-bold mb-1 ${actualDeparture ? 'text-green-600' : 'text-gray-900'}`}>
          <FlightTimeDisplay dateTime={displayDepartureTime} />
        </div>
        
        {/* Mostrar horario programado si hay diferencia */}
        {actualDeparture && scheduledDeparture && actualDeparture !== scheduledDeparture && (
          <div className="space-y-1">
            <div className="text-sm text-gray-500">
              Programado: <span className="line-through"><FlightTimeDisplay dateTime={scheduledDeparture} /></span>
            </div>
            {departureDiff && (
              <div className={`text-xs font-medium ${departureDiff.isDelay ? 'text-red-600' : 'text-green-600'}`}>
                {departureDiff.isDelay ? '+' : '-'}{departureDiff.minutes} min {departureDiff.isDelay ? 'retraso' : 'adelanto'}
              </div>
            )}
          </div>
        )}
        
        {/* Indicadores de datos reales */}
        <div className="mt-2 space-y-1">
          {actualDeparture && (
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span className="text-xs text-green-600">Hora REAL de API</span>
            </div>
          )}
          {apiDepartureCity && (
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              <span className="text-xs text-blue-600">Ciudad REAL de API</span>
            </div>
          )}
          {(apiDepartureGate || apiDepartureTerminal) && (
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
              <span className="text-xs text-purple-600">Info completa de API</span>
            </div>
          )}
        </div>
      </div>

      {/* Llegada */}
      <div>
        <div className="text-sm text-gray-500 mb-1">
          Información de llegada
        </div>
        <div className="font-medium mb-2 space-y-1">
          <div>{displayArrivalInfo.city} · <FlightDateDisplay dateTime={arrivalDate} /></div>
          {displayArrivalInfo.airport && displayArrivalInfo.airport !== displayArrivalInfo.city && (
            <div className="text-sm text-blue-600">Aeropuerto: {displayArrivalInfo.airport}</div>
          )}
          {displayArrivalInfo.terminal && (
            <div className="text-sm text-purple-600">Terminal: {displayArrivalInfo.terminal}</div>
          )}
          {displayArrivalInfo.gate && (
            <div className="text-sm text-orange-600">Gate: {displayArrivalInfo.gate}</div>
          )}
        </div>
        <div className="text-sm text-gray-600 mb-1">
          {actualArrival ? 'Llegada Real (API)' : 'Llegada Programada'}
        </div>
        <div className={`text-2xl font-bold mb-1 ${actualArrival ? 'text-green-600' : 'text-gray-900'}`}>
          <FlightTimeDisplay dateTime={displayArrivalTime} />
        </div>
        
        {/* Mostrar horario programado si hay diferencia */}
        {actualArrival && scheduledArrival && actualArrival !== scheduledArrival && (
          <div className="space-y-1">
            <div className="text-sm text-gray-500">
              Programado: <span className="line-through"><FlightTimeDisplay dateTime={scheduledArrival} /></span>
            </div>
            {arrivalDiff && (
              <div className={`text-xs font-medium ${arrivalDiff.isDelay ? 'text-red-600' : 'text-green-600'}`}>
                {arrivalDiff.isDelay ? '+' : '-'}{arrivalDiff.minutes} min {arrivalDiff.isDelay ? 'retraso' : 'adelanto'}
              </div>
            )}
          </div>
        )}
        
        {/* Indicadores de datos reales */}
        <div className="mt-2 space-y-1">
          {actualArrival && (
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span className="text-xs text-green-600">Hora REAL de API</span>
            </div>
          )}
          {apiArrivalCity && (
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              <span className="text-xs text-blue-600">Ciudad REAL de API</span>
            </div>
          )}
          {(apiArrivalGate || apiArrivalTerminal) && (
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
              <span className="text-xs text-purple-600">Info completa de API</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
