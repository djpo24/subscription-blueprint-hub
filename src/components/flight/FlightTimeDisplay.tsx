
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

interface FlightTimeDisplayProps {
  dateTime: string | null;
  className?: string;
}

export function FlightTimeDisplay({ dateTime, className = '' }: FlightTimeDisplayProps) {
  const formatTime = (dateTime: string | null) => {
    if (!dateTime) return '-';
    try {
      // Mostrar la hora exactamente como viene de la API, sin conversiones adicionales
      return format(parseISO(dateTime), 'HH:mm', { locale: es });
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
