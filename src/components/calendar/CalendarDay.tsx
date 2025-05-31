
import { useState } from 'react';
import { isSameMonth, format } from 'date-fns';
import { TripIndicator } from './TripIndicator';
import { TripPopover } from './TripPopover';

interface Trip {
  id: string;
  trip_date: string;
  origin: string;
  destination: string;
  flight_number: string | null;
  status: string;
  created_at: string;
}

interface CalendarDayProps {
  day: Date;
  currentDate: Date;
  trips: Trip[];
  onAddPackage: (tripId: string) => void;
}

export function CalendarDay({ day, currentDate, trips, onAddPackage }: CalendarDayProps) {
  const [showPopover, setShowPopover] = useState(false);
  
  const isCurrentMonth = isSameMonth(day, currentDate);
  const dayNumber = format(day, 'd');
  
  const handleDayClick = () => {
    if (trips.length > 0) {
      setShowPopover(true);
    }
  };

  return (
    <>
      <div
        onClick={handleDayClick}
        className={`
          relative min-h-[60px] md:min-h-[80px] p-1 md:p-2 border rounded-lg
          ${isCurrentMonth ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-100'}
          ${trips.length > 0 ? 'cursor-pointer hover:bg-gray-50 transition-colors' : ''}
        `}
      >
        <div className={`text-xs md:text-sm font-medium ${isCurrentMonth ? 'text-black' : 'text-gray-400'}`}>
          {dayNumber}
        </div>
        
        {trips.length > 0 && (
          <div className="mt-1 space-y-1">
            {trips.slice(0, 2).map((trip) => (
              <TripIndicator key={trip.id} trip={trip} />
            ))}
            {trips.length > 2 && (
              <div className="text-xs text-gray-500 font-medium">
                +{trips.length - 2} más
              </div>
            )}
          </div>
        )}
      </div>

      <TripPopover
        trips={trips}
        open={showPopover}
        onOpenChange={setShowPopover}
        onAddPackage={onAddPackage}
      />
    </>
  );
}
