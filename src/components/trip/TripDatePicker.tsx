
import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface TripDatePickerProps {
  date: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
  today: Date;
}

export function TripDatePicker({ date, onDateChange, today }: TripDatePickerProps) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const handleDateSelect = (selectedDate: Date | undefined) => {
    onDateChange(selectedDate);
    if (selectedDate) {
      setIsCalendarOpen(false);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="trip_date" className="text-sm font-medium text-black">
        Fecha del Viaje
      </Label>
      <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full h-12 justify-start text-left font-normal bg-gray-100 border-0 hover:bg-white focus:bg-white focus:ring-2 focus:ring-black rounded-lg",
              !date && "text-gray-500"
            )}
          >
            <CalendarIcon className="mr-3 h-4 w-4 text-gray-400" />
            {date ? format(date, "dd/MM/yyyy", { locale: es }) : "Seleccionar fecha"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 bg-white border-0 shadow-xl rounded-lg pointer-events-auto" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            disabled={(date) => {
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              return date < today;
            }}
            initialFocus
            locale={es}
            weekStartsOn={0}
            className="pointer-events-auto"
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
