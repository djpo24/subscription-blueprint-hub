
import { formatDispatchDate } from '@/utils/dateUtils';

interface FlightDateDisplayProps {
  dateTime: string | null;
  className?: string;
}

export function FlightDateDisplay({ dateTime, className = '' }: FlightDateDisplayProps) {
  const formatDate = (dateTime: string | null) => {
    if (!dateTime) return '-';
    try {
      // Extract just the date part if it's a full datetime string
      const datePart = dateTime.split('T')[0];
      return formatDispatchDate(datePart);
    } catch (error) {
      console.error('❌ [FlightDateDisplay] Error formatting date:', error);
      return '-';
    }
  };

  return (
    <span className={className}>
      {formatDate(dateTime)}
    </span>
  );
}
