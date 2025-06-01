
import { format, parseISO } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { es } from 'date-fns/locale';

interface FlightDateDisplayProps {
  dateTime: string | null;
  className?: string;
}

export function FlightDateDisplay({ dateTime, className = '' }: FlightDateDisplayProps) {
  const formatDate = (dateTime: string | null) => {
    if (!dateTime) return '-';
    try {
      // Formatear la fecha en zona horaria de Bogotá
      const bogotaDate = formatInTimeZone(dateTime, 'America/Bogota', 'EEE, dd \'de\' MMM', { locale: es });
      console.log('formatDate input:', dateTime, 'formatted in Bogotá timezone:', bogotaDate);
      return bogotaDate;
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
