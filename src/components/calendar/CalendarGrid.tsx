
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
  onCreateTrip: (date: Date) => void;
  onViewPackagesByDate?: (date: Date) => void;
}

export function CalendarGrid({ calendarDays, currentDate, trips, onAddPackage, onCreateTrip, onViewPackagesByDate }: CalendarGridProps) {
  const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  console.log('CalendarGrid total trips:', trips.length);

  const getTripsForDate = (date: Date) => {
    const tripsForDate = trips.filter(trip => {
      // Usar parseISO para asegurar que la fecha se parsee correctamente
      const tripDate = parseISO(trip.trip_date);
      const isSame = isSameDay(tripDate, date);
      return isSame;
    });
    
    if (tripsForDate.length > 0) {
      console.log(`Found ${tripsForDate.length} trips for date ${date.toDateString()}:`, tripsForDate);
    }
    
    return tripsForDate;
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
              onCreateTrip={onCreateTrip}
              onViewPackagesByDate={onViewPackagesByDate}
            />
          );
        })}
      </div>
    </>
  );
}
