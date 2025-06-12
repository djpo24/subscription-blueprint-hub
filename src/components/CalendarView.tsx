
import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns';
import { CalendarHeader } from './calendar/CalendarHeader';
import { CalendarGrid } from './calendar/CalendarGrid';

interface Trip {
  id: string;
  trip_date: string;
  origin: string;
  destination: string;
  flight_number: string | null;
  status: string;
  created_at: string;
}

interface CalendarViewProps {
  trips: Trip[];
  isLoading: boolean;
  onAddPackage: (tripId: string) => void;
  onCreateTrip: (date: Date) => void;
  onViewPackagesByDate?: (date: Date) => void;
  previewRole?: 'admin' | 'employee' | 'traveler';
}

export function CalendarView({ 
  trips, 
  isLoading, 
  onAddPackage, 
  onCreateTrip, 
  onViewPackagesByDate,
  previewRole 
}: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  console.log('CalendarView received trips:', trips);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const goToPreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  if (isLoading) {
    return (
      <Card className="uber-card">
        <CardHeader className="px-3 sm:px-6">
          <CalendarHeader
            currentDate={currentDate}
            onPreviousMonth={goToPreviousMonth}
            onNextMonth={goToNextMonth}
          />
        </CardHeader>
        <CardContent className="px-3 sm:px-6">
          <div className="flex justify-center py-8">
            <div className="text-gray-500 text-sm">Cargando...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="uber-card">
      <CardHeader className="px-3 sm:px-6 pb-3 sm:pb-6">
        <CalendarHeader
          currentDate={currentDate}
          onPreviousMonth={goToPreviousMonth}
          onNextMonth={goToNextMonth}
        />
      </CardHeader>
      <CardContent className="px-2 sm:px-6 pb-3 sm:pb-6">
        <CalendarGrid
          calendarDays={calendarDays}
          currentDate={currentDate}
          trips={trips}
          onAddPackage={onAddPackage}
          onCreateTrip={onCreateTrip}
          onViewPackagesByDate={onViewPackagesByDate}
          previewRole={previewRole}
        />
      </CardContent>
    </Card>
  );
}
