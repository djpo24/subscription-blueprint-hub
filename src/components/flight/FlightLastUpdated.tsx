
import { parseISO } from 'date-fns';

interface FlightLastUpdatedProps {
  lastUpdated: string;
}

export function FlightLastUpdated({ lastUpdated }: FlightLastUpdatedProps) {
  const calculateTimeSinceUpdate = () => {
    const now = new Date();
    const lastUpdate = parseISO(lastUpdated);
    const diffMinutes = Math.round((now.getTime() - lastUpdate.getTime()) / (1000 * 60));
    
    if (diffMinutes < 60) {
      return `${diffMinutes} min`;
    } else {
      const hours = Math.floor(diffMinutes / 60);
      const minutes = diffMinutes % 60;
      return `${hours} h ${minutes} min`;
    }
  };

  return (
    <div className="text-xs text-gray-500 text-center">
      Se actualizó hace {calculateTimeSinceUpdate()}
    </div>
  );
}
