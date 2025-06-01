
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
      // Asegurar que la fecha esté en formato ISO correcto
      const isoDateTime = dateTime.includes('T') ? dateTime : `${dateTime}T00:00:00Z`;
      
      // Formatear la fecha en zona horaria de Bogotá (UTC-5)
      const bogotaDate = formatInTimeZone(isoDateTime, 'America/Bogota', 'EEE, dd \'de\' MMM', { locale: es });
      console.log('FlightDateDisplay - input:', dateTime, 'output en Bogotá:', bogotaDate);
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
