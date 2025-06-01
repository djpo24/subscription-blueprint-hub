
interface FlightDateDisplayProps {
  dateTime: string | null;
  className?: string;
}

export function FlightDateDisplay({ dateTime, className = '' }: FlightDateDisplayProps) {
  const formatDate = (dateTime: string | null) => {
    if (!dateTime) return '-';
    
    // Mostrar EXACTAMENTE como viene de la base de datos sin conversiones
    try {
      // Extraer solo la parte de la fecha sin conversiones
      const date = new Date(dateTime);
      const year = date.getUTCFullYear();
      const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
      const day = date.getUTCDate().toString().padStart(2, '0');
      return `${day}/${month}/${year}`;
    } catch (error) {
      console.error('Error extracting date:', error);
      // Si hay error, mostrar directamente el string tal como viene
      return dateTime.substring(0, 10) || dateTime;
    }
  };

  return (
    <span className={className}>
      {formatDate(dateTime)}
    </span>
  );
}
