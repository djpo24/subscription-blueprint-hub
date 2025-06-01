
interface FlightTimeDisplayProps {
  dateTime: string | null;
  className?: string;
}

export function FlightTimeDisplay({ dateTime, className = '' }: FlightTimeDisplayProps) {
  const formatTime = (dateTime: string | null) => {
    if (!dateTime) return '-';
    
    // Mostrar EXACTAMENTE como viene de la base de datos sin conversiones
    try {
      // Extraer solo la parte de la hora sin conversiones de zona horaria
      const date = new Date(dateTime);
      const hours = date.getUTCHours().toString().padStart(2, '0');
      const minutes = date.getUTCMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    } catch (error) {
      console.error('Error extracting time:', error);
      // Si hay error, mostrar directamente el string tal como viene
      return dateTime.substring(11, 16) || dateTime;
    }
  };

  return (
    <span className={className}>
      {formatTime(dateTime)}
    </span>
  );
}
