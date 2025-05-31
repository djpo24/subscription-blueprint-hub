
import { isSameDay, parseISO } from 'date-fns';
import { CalendarDay } from './CalendarDay';

interface Trip {
  id: string;
  trip_date: string;
  origin: string;
  destination: string;
  flight_number: string | null;
  status: string;
  created_at: string;
}

interface CalendarGridProps {
  calendarDays: Date[];
  currentDate: Date;
  trips: Trip[];
  onAddPackage: (tripId: string) => void;
}

export function CalendarGrid({ calendarDays, currentDate, trips, onAddPackage }: CalendarGridProps) {
  const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  const getTripsForDate = (date: Date) => {
    return trips.filter(trip => {
      // Usar parseISO para asegurar que la fecha se parsee correctamente
      const tripDate = parseISO(trip.trip_date);
      return isSameDay(tripDate, date);
    });
  };

  return (
    <>
      <div className="grid grid-cols-7 gap-1 md:gap-2 mb-4">
        {weekDays.map((day) => (
          <div 
            key={day} 
            className="p-2 md:p-3 text-center font-bold text-black text-xs md:text-sm bg-gray-100 rounded-lg"
          >
            {day}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-1 md:gap-2">
        {calendarDays.map((day) => {
          const dayTrips = getTripsForDate(day);
          
          return (
            <CalendarDay
              key={day.toISOString()}
              day={day}
              currentDate={currentDate}
              trips={dayTrips}
              onAddPackage={onAddPackage}
            />
          );
        })}
      </div>
    </>
  );
}
