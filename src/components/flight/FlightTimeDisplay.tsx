
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
      const hours = date.getUTCHours().toString().padStart(2, '0');
      const minutes = date.getUTCMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
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
