
import { FlightTimeDisplay } from './FlightTimeDisplay';
import { FlightDateDisplay } from './FlightDateDisplay';
import { FlightTerminalGateInfo } from './FlightTerminalGateInfo';

interface FlightArrivalSectionProps {
  arrivalDate: string | null;
  actualArrival: string | null;
  arrivalTime: string | null;
  scheduledArrival: string | null;
  gate?: string;
  terminal?: string;
}

export function FlightArrivalSection({
  arrivalDate,
  actualArrival,
  arrivalTime,
  scheduledArrival,
  gate,
  terminal
}: FlightArrivalSectionProps) {
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

  const arrivalDiff = calculateTimeDifference(scheduledArrival, actualArrival);

  return (
    <div className="space-y-3">
      <div className="border-b pb-2">
        <h3 className="font-semibold text-lg">Llegada</h3>
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
        {scheduledArrival && actualArrival && scheduledArrival !== actualArrival && (
          <div className="flex flex-col mt-1">
            <div className="text-sm text-gray-500 line-through">
              Programado: <FlightTimeDisplay dateTime={scheduledArrival} />
            </div>
            {arrivalDiff && (
              <div className={`text-xs ${arrivalDiff.isDelay ? 'text-red-500' : 'text-green-500'}`}>
                {arrivalDiff.isDelay ? `+${arrivalDiff.minutes} min retraso` : `-${arrivalDiff.minutes} min adelanto`}
              </div>
            )}
          </div>
        )}
      </div>

      <FlightTerminalGateInfo gate={gate} terminal={terminal} />
    </div>
  );
}
