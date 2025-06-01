
import { FlightTimeDisplay } from './FlightTimeDisplay';
import { TimeDifference } from './FlightTimeDifferenceCalculator';

interface FlightTimeInfoProps {
  displayTime: string | null;
  scheduledTime: string | null;
  actualTime: string | null;
  timeDiff: TimeDifference | null;
  isActual: boolean;
}

export function FlightTimeInfo({ displayTime, scheduledTime, actualTime, timeDiff, isActual }: FlightTimeInfoProps) {
  // Función para mostrar tiempo sin formateo adicional
  const showRawTime = (dateTime: string | null) => {
    if (!dateTime) return '-';
    
    try {
      // Mostrar solo la hora sin conversiones
      const date = new Date(dateTime);
      const hours = date.getUTCHours().toString().padStart(2, '0');
      const minutes = date.getUTCMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    } catch {
      // Si hay error, mostrar directamente parte de la cadena
      return dateTime.substring(11, 16) || dateTime;
    }
  };

  return (
    <div>
      <div className="text-sm text-gray-600 mb-1">
        {isActual ? 'Hora Real (API)' : 'Hora Programada'}
      </div>
      <div className={`text-2xl font-bold mb-1 ${isActual ? 'text-green-600' : 'text-gray-900'}`}>
        {showRawTime(displayTime)}
      </div>
      
      {/* Mostrar horario programado si hay diferencia */}
      {actualTime && scheduledTime && actualTime !== scheduledTime && (
        <div className="space-y-1">
          <div className="text-sm text-gray-500">
            Programado: <span className="line-through">{showRawTime(scheduledTime)}</span>
          </div>
          {timeDiff && (
            <div className={`text-xs font-medium ${timeDiff.isDelay ? 'text-red-600' : 'text-green-600'}`}>
              {timeDiff.isDelay ? '+' : '-'}{timeDiff.minutes} min {timeDiff.isDelay ? 'retraso' : 'adelanto'}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
