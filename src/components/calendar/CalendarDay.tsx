
import { format, isSameMonth, isSameDay } from 'date-fns';
import { useState } from 'react';
import { TripIndicator } from './TripIndicator';
import { TripPopover } from './TripPopover';
import { TripCard } from './TripCard';

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
      className={`min-h-[80px] md:min-h-[120px] lg:min-h-[160px] rounded-lg border transition-all duration-200 relative ${
        isCurrentMonth 
          ? isToday 
            ? 'bg-black text-white border-black' 
            : 'bg-white border-gray-200 hover:border-gray-300' 
          : 'bg-gray-50 border-gray-100'
      }`}
    >
      <div className={`p-2 md:p-3 h-full ${
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
          <>
            {/* Vista móvil y tablet - solo indicadores */}
            <div className="block lg:hidden">
              <TripIndicator
                trips={trips}
                onShowPopover={() => setShowPopover(true)}
              />
            </div>
            
            {/* Vista desktop - información completa */}
            <div className="hidden lg:block space-y-2 overflow-y-auto max-h-[120px]">
              {trips.slice(0, 2).map((trip) => (
                <div key={trip.id} className="text-xs">
                  <TripCard
                    trip={trip}
                    onAddPackage={onAddPackage}
                    compact={true}
                  />
                </div>
              ))}
              {trips.length > 2 && (
                <button
                  onClick={() => setShowPopover(true)}
                  className="text-xs text-gray-600 hover:text-black transition-colors"
                >
                  +{trips.length - 2} más
                </button>
              )}
            </div>
          </>
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
