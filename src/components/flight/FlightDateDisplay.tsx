
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

interface FlightDateDisplayProps {
  dateTime: string | null;
  className?: string;
}

export function FlightDateDisplay({ dateTime, className = '' }: FlightDateDisplayProps) {
  const formatDate = (dateTime: string | null) => {
    if (!dateTime) return '-';
    try {
      const date = parseISO(dateTime);
      console.log('formatDate input:', dateTime, 'parsed date:', date, 'formatted:', format(date, 'EEE, dd \'de\' MMM', { locale: es }));
      return format(date, 'EEE, dd \'de\' MMM', { locale: es });
    } catch (error) {
      console.error('Error formatting date:', error);
      return '-';
    }
  };

  return (
    <span className={className}>
      {formatDate(dateTime)}
    </span>
  );
}
