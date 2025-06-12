
import { isSameDay, isSameMonth, format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { CalendarDay } from './CalendarDay';
import { TripPopover } from './TripPopover';
import { TripDialog } from '@/components/TripDialog';
import { useState } from 'react';

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
  previewRole?: 'admin' | 'employee' | 'traveler';
}

export function CalendarGrid({
  calendarDays,
  currentDate,
  trips,
  onAddPackage,
  onCreateTrip,
  onViewPackagesByDate,
  previewRole
}: CalendarGridProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [tripPopoverOpen, setTripPopoverOpen] = useState(false);
  const [tripDialogOpen, setTripDialogOpen] = useState(false);

  const getTripsForDate = (date: Date) => {
    return trips.filter(trip => 
      isSameDay(new Date(trip.trip_date + 'T00:00:00'), date)
    );
  };

  const handleDayClick = (date: Date) => {
    const dayTrips = getTripsForDate(date);
    setSelectedDate(date);
    
    if (dayTrips.length > 0) {
      setTripPopoverOpen(true);
    } else {
      setTripDialogOpen(true);
    }
  };

  const handleTripSuccess = () => {
    setTripDialogOpen(false);
    setSelectedDate(null);
  };

  const handleTripPopoverClose = (open: boolean) => {
    setTripPopoverOpen(open);
    if (!open) {
      setSelectedDate(null);
    }
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Días de la semana - Header */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
          <div key={day} className="text-center text-xs sm:text-sm font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Grid del calendario */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {calendarDays.map((day, index) => {
          const dayTrips = getTripsForDate(day);

          return (
            <CalendarDay
              key={index}
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

      {/* Popover para mostrar viajes del día */}
      {selectedDate && (
        <TripPopover
          trips={getTripsForDate(selectedDate)}
          open={tripPopoverOpen}
          onOpenChange={handleTripPopoverClose}
          onAddPackage={onAddPackage}
          onViewPackagesByDate={onViewPackagesByDate}
          selectedDate={selectedDate}
          previewRole={previewRole}
        />
      )}

      {/* Dialog para crear nuevo viaje */}
      {selectedDate && (
        <TripDialog
          open={tripDialogOpen}
          onOpenChange={setTripDialogOpen}
          onSuccess={handleTripSuccess}
          initialDate={selectedDate}
        />
      )}
    </div>
  );
}
