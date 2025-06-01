
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
      // Asegurar que la fecha esté en formato ISO correcto
      const isoDateTime = dateTime.includes('T') ? dateTime : `${dateTime}T00:00:00Z`;
      
      // Formatear la hora en zona horaria de Bogotá (UTC-5)
      const bogotaTime = formatInTimeZone(isoDateTime, 'America/Bogota', 'HH:mm', { locale: es });
      console.log('FlightTimeDisplay - input:', dateTime, 'output en Bogotá:', bogotaTime);
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
