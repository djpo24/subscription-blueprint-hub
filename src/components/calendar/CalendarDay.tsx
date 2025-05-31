
import { format, isSameMonth, isSameDay } from 'date-fns';
import { useState } from 'react';
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
  const isToday = isSameDay(day, new Date());

  return (
    <div
      className={`min-h-[80px] rounded-lg border transition-all duration-200 relative ${
        isCurrentMonth 
          ? isToday 
            ? 'bg-black text-white border-black' 
            : 'bg-white border-gray-200 hover:border-gray-300' 
          : 'bg-gray-50 border-gray-100'
      }`}
    >
      <div className={`p-3 ${
        isCurrentMonth 
          ? isToday 
            ? 'text-white' 
            : 'text-black' 
          : 'text-gray-400'
      }`}>
        <div className="font-medium text-sm mb-2">
          {format(day, 'd')}
        </div>
        
        {trips.length > 0 && (
          <TripIndicator
            trips={trips}
            onShowPopover={() => setShowPopover(true)}
          />
        )}
      </div>

      {showPopover && trips.length > 0 && (
        <TripPopover
          trips={trips}
          onClose={() => setShowPopover(false)}
          onAddPackage={onAddPackage}
        />
      )}
    </div>
  );
}
