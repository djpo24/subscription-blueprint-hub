
interface FlightDateDisplayProps {
  dateTime: string | null;
  className?: string;
}

export function FlightDateDisplay({ dateTime, className = '' }: FlightDateDisplayProps) {
  const formatDate = (dateTime: string | null) => {
    if (!dateTime) return '-';
    try {
      // Extraer solo la fecha del string ISO sin conversiones de zona horaria
      const date = new Date(dateTime);
      const year = date.getUTCFullYear();
      const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
      const day = date.getUTCDate().toString().padStart(2, '0');
      return `${day}/${month}/${year}`;
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
