
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
      // Formatear la hora en zona horaria de Bogotá
      const bogotaTime = formatInTimeZone(dateTime, 'America/Bogota', 'HH:mm', { locale: es });
      console.log('formatTime input:', dateTime, 'formatted in Bogotá timezone:', bogotaTime);
      return bogotaTime;
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
