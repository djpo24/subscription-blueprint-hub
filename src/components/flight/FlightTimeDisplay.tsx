
interface FlightTimeDisplayProps {
  dateTime: string | null;
  className?: string;
}

export function FlightTimeDisplay({ dateTime, className = '' }: FlightTimeDisplayProps) {
  const formatTime = (dateTime: string | null) => {
    if (!dateTime) return '-';
    try {
      // Extraer solo la hora y minutos del string ISO sin conversiones de zona horaria
      const date = new Date(dateTime);
      const hours = date.getUTCHours();
      const minutes = date.getUTCMinutes();
      
      // Convertir a formato 12 horas
      const period = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
      const displayMinutes = minutes.toString().padStart(2, '0');
      
      return `${displayHours}:${displayMinutes} ${period}`;
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
