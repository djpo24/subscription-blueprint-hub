
import { format, parseISO } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { es } from 'date-fns/locale';

interface FlightTimeDisplayProps {
  dateTime: string | null;
  className?: string;
}

export function FlightTimeDisplay({ dateTime, className = '' }: FlightTimeDisplayProps) {
  const formatTime = (dateTime: string | null) => {
    if (!dateTime) return '-';
    try {
      // Convertir la hora UTC a zona horaria de Colombia (America/Bogota)
      return formatInTimeZone(dateTime, 'America/Bogota', 'HH:mm', { locale: es });
    } catch (error) {
      console.error('Error formatting time:', error);
      return '-';
    }
  };

  return (
    <span className={className}>
      {formatTime(dateTime)}
    </span>
  );
}
