
import { format, parseISO } from 'date-fns';

interface FlightTimeFormatterProps {
  dateTime: string | null;
  formatType: 'time' | 'date';
}

export function FlightTimeFormatter({ dateTime, formatType }: FlightTimeFormatterProps) {
  if (!dateTime) return null;
  
  try {
    const parsedDate = parseISO(dateTime);
    return formatType === 'time' 
      ? format(parsedDate, 'h:mm a') // Formato 12 horas con AM/PM
      : format(parsedDate, 'yyyy-MM-dd');
  } catch {
    return null;
  }
}

export const useFlightTimeFormatting = () => {
  const formatTime = (dateTime: string | null) => {
    if (!dateTime) return null;
    try {
      return format(parseISO(dateTime), 'h:mm a'); // Formato 12 horas con AM/PM
    } catch {
      return null;
    }
  };

  const formatDate = (dateTime: string | null) => {
    if (!dateTime) return null;
    try {
      return format(parseISO(dateTime), 'yyyy-MM-dd');
    } catch {
      return null;
    }
  };

  return { formatTime, formatDate };
};
