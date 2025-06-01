
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
      const date = parseISO(dateTime);
      console.log('formatTime input:', dateTime, 'parsed date:', date);
      return format(date, 'h:mm a', { locale: es });
    } catch {
      return '-';
    }
  };

  return (
    <span className={className}>
      {formatTime(dateTime)}
    </span>
  );
}
