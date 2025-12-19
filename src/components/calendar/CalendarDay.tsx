
import { useState } from 'react';
import { isSameMonth, format, isToday, isBefore, startOfDay } from 'date-fns';
import { Plus } from 'lucide-react';
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
  onCreateTrip: (date: Date) => void;
  onViewPackagesByDate?: (date: Date) => void;
}

export function CalendarDay({ day, currentDate, trips, onAddPackage, onCreateTrip, onViewPackagesByDate }: CalendarDayProps) {
  const [showPopover, setShowPopover] = useState(false);
  
  const isCurrentMonth = isSameMonth(day, currentDate);
  const isTodayDate = isToday(day);
  const dayNumber = format(day, 'd');
  
  // Verificar si la fecha es anterior a hoy
  const today = startOfDay(new Date());
  const dayDate = startOfDay(day);
  const isPastDate = isBefore(dayDate, today);
  
  const handleDayClick = () => {
    if (trips.length > 0) {
      setShowPopover(true);
    } else if (!isPastDate) {
      // Solo permitir crear viaje si no es una fecha pasada
      onCreateTrip(day);
    }
    // Si es una fecha pasada y no hay viajes, no hacer nada
  };

  const handleShowPopover = () => {
    setShowPopover(true);
  };

  const handleCreateTripClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCreateTrip(day);
  };

  return (
    <>
      <div
        onClick={handleDayClick}
        className={`
          relative min-h-[70px] md:min-h-[80px] p-1 md:p-2 border rounded-lg 
          ${isPastDate ? 'cursor-default' : 'cursor-pointer'}
          ${!isTodayDate && isCurrentMonth ? 'bg-white border-gray-200 hover:bg-gray-50' : ''}
          ${!isTodayDate && !isCurrentMonth ? 'bg-gray-50 border-gray-100 hover:bg-gray-100' : ''}
          ${!isTodayDate && trips.length > 0 ? 'hover:bg-gray-50 transition-colors' : ''}
          ${isTodayDate ? 'bg-black border-black hover:bg-gray-900' : ''}
          ${isPastDate && !trips.length ? 'opacity-50' : ''}
          transition-colors
        `}
      >
        {/* Header del día con número y botón + */}
        <div className="flex items-center justify-between mb-1">
          <div className={`text-xs md:text-sm font-medium 
            ${isCurrentMonth && !isTodayDate ? 'text-black' : ''}
            ${!isCurrentMonth && !isTodayDate ? 'text-gray-400' : ''}
            ${isTodayDate ? 'text-white' : ''}
            ${isPastDate ? 'text-gray-400' : ''}
          `}>
            {dayNumber}
          </div>
          
          {/* Botón + para crear viaje (visible cuando hay viajes y no es fecha pasada) */}
          {trips.length > 0 && !isPastDate && (
            <button
              onClick={handleCreateTripClick}
              className={`
                w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center
                transition-all duration-200 touch-manipulation
                ${isTodayDate 
                  ? 'bg-white/20 hover:bg-white/30 text-white' 
                  : 'bg-primary/10 hover:bg-primary/20 text-primary'
                }
              `}
              title="Crear nuevo viaje"
            >
              <Plus className="w-3 h-3 md:w-4 md:h-4" />
            </button>
          )}
        </div>
        
        {trips.length > 0 && (
          <div className="mt-0.5">
            <TripIndicator trips={trips} onShowPopover={handleShowPopover} />
          </div>
        )}
        
        {trips.length === 0 && isCurrentMonth && !isPastDate && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
            <div className={`text-xs font-medium ${isTodayDate ? 'text-white/70' : 'text-gray-500'}`}>
              + Crear viaje
            </div>
          </div>
        )}
      </div>

      <TripPopover
        trips={trips}
        open={showPopover}
        onOpenChange={setShowPopover}
        onAddPackage={onAddPackage}
        onCreateTrip={onCreateTrip}
        onViewPackagesByDate={onViewPackagesByDate}
        selectedDate={day}
      />
    </>
  );
}
