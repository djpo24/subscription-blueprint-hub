
import { FlightTimeDisplay } from './FlightTimeDisplay';
import { FlightDateDisplay } from './FlightDateDisplay';
import { FlightLastUpdated } from './FlightLastUpdated';

interface FlightDepartureSectionProps {
  departureDate: string | null;
  actualDeparture: string | null;
  departureTime: string | null;
  scheduledDeparture: string | null;
  lastUpdated: string;
}

export function FlightDepartureSection({
  departureDate,
  actualDeparture,
  departureTime,
  scheduledDeparture,
  lastUpdated
}: FlightDepartureSectionProps) {
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

  return (
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
        {scheduledDeparture && actualDeparture && scheduledDeparture !== actualDeparture && (
          <div className="flex flex-col mt-1">
            <div className="text-sm text-gray-500 line-through">
              Programado: <FlightTimeDisplay dateTime={scheduledDeparture} />
            </div>
            {departureDiff && (
              <div className={`text-xs ${departureDiff.isDelay ? 'text-red-500' : 'text-green-500'}`}>
                {departureDiff.isDelay ? `+${departureDiff.minutes} min retraso` : `-${departureDiff.minutes} min adelanto`}
              </div>
            )}
          </div>
        )}
      </div>

      <FlightLastUpdated lastUpdated={lastUpdated} />
    </div>
  );
}
