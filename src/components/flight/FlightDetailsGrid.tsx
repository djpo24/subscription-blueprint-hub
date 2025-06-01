
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
  
  console.log('FlightDetailsGrid - datos recibidos:', {
    departureTime,
    arrivalTime,
    actualDeparture,
    actualArrival,
    scheduledDeparture,
    scheduledArrival
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

  // Determinar qué horarios mostrar - SIEMPRE priorizar horarios reales si existen
  const displayDepartureTime = actualDeparture || departureTime;
  const displayArrivalTime = actualArrival || arrivalTime;

  console.log('FlightDetailsGrid - horarios a mostrar:', {
    displayDepartureTime,
    displayArrivalTime,
    departureDiff,
    arrivalDiff
  });

  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Salida */}
      <div>
        <div className="text-sm text-gray-500 mb-1">
          Información del aeropuerto
        </div>
        <div className="font-medium mb-2">
          {departureAirport} · <FlightDateDisplay dateTime={departureDate} />
        </div>
        <div className="text-sm text-gray-600 mb-1">
          {actualDeparture ? 'Salida Real' : 'Salida Programada'}
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
        
        {/* Indicador de datos reales */}
        {actualDeparture && (
          <div className="flex items-center gap-1 mt-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <span className="text-xs text-green-600">Hora real confirmada</span>
          </div>
        )}
      </div>

      {/* Llegada */}
      <div>
        <div className="text-sm text-gray-500 mb-1">
          Información del aeropuerto
        </div>
        <div className="font-medium mb-2">
          {arrivalAirport} · <FlightDateDisplay dateTime={arrivalDate} />
        </div>
        <div className="text-sm text-gray-600 mb-1">
          {actualArrival ? 'Llegada Real' : 'Llegada Programada'}
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
        
        {/* Indicador de datos reales */}
        {actualArrival && (
          <div className="flex items-center gap-1 mt-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <span className="text-xs text-green-600">Hora real confirmada</span>
          </div>
        )}
      </div>
    </div>
  );
}
