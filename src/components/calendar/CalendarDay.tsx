
import { format, isSameMonth, isSameDay } from 'date-fns';
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
  const isCurrentMonth = isSameMonth(day, currentDate);
  const isToday = isSameDay(day, new Date());

  return (
    <div
      className={`min-h-[140px] rounded-xl border-2 p-3 transition-all duration-200 ${
        isCurrentMonth 
          ? isToday 
            ? 'bg-black text-white border-black' 
            : 'bg-white border-gray-200 hover:border-gray-300' 
          : 'bg-gray-50 border-gray-100'
      }`}
    >
      <div className={`font-bold text-sm mb-3 ${
        isCurrentMonth 
          ? isToday 
            ? 'text-white' 
            : 'text-black' 
          : 'text-gray-400'
      }`}>
        {format(day, 'd')}
      </div>
      
      <div className="space-y-2">
        {trips.map((trip) => (
          <div key={trip.id} className="space-y-2">
            <TripCard trip={trip} onAddPackage={onAddPackage} />
          </div>
        ))}
      </div>
    </div>
  );
}
