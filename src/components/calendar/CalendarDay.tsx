import { useState } from 'react';
import { isSameMonth, format, isToday } from 'date-fns';
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
  const isTodayDate = isToday(day);
  const dayNumber = format(day, 'd');
  
  const handleDayClick = () => {
    if (trips.length > 0) {
      setShowPopover(true);
    }
  };

  const handleShowPopover = () => {
    setShowPopover(true);
  };

  return (
    <>
      <div
        onClick={handleDayClick}
        className={`
          relative min-h-[60px] md:min-h-[80px] p-1 md:p-2 border rounded-lg
          ${!isTodayDate && isCurrentMonth ? 'bg-white border-gray-200' : ''}
          ${!isTodayDate && !isCurrentMonth ? 'bg-gray-50 border-gray-100' : ''}
          ${!isTodayDate && trips.length > 0 ? 'cursor-pointer hover:bg-gray-50 transition-colors' : ''}
          ${isTodayDate ? 'bg-black border-black cursor-pointer' : ''}
          ${trips.length > 0 && !isTodayDate ? '' : trips.length > 0 ? 'cursor-pointer' : ''}
        `}
      >
        <div className={`text-xs md:text-sm font-medium 
          ${isCurrentMonth && !isTodayDate ? 'text-black' : ''}
          ${!isCurrentMonth && !isTodayDate ? 'text-gray-400' : ''}
          ${isTodayDate ? 'text-white' : ''}
        `}>
          {dayNumber}
        </div>
        
        {trips.length > 0 && (
          <div className="mt-1">
            <TripIndicator trips={trips} onShowPopover={handleShowPopover} />
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
