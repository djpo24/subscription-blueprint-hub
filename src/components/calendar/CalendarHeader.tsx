
import { Button } from '@/components/ui/button';
import { CardTitle, CardDescription } from '@/components/ui/card';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface CalendarHeaderProps {
  currentDate: Date;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
}

export function CalendarHeader({ currentDate, onPreviousMonth, onNextMonth }: CalendarHeaderProps) {
  return (
    <div className="w-full">
      <div className="w-full mb-4">
        <CardTitle className="text-black w-full">Calendario de Viajes</CardTitle>
        <CardDescription className="text-gray-600 w-full">
          Vista de calendario de todos los viajes programados
        </CardDescription>
      </div>
      <div className="flex items-center justify-center gap-3">
        <Button variant="secondary" size="icon" onClick={onPreviousMonth} className="uber-button-secondary">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-xl font-bold text-black min-w-[200px] text-center">
          {format(currentDate, 'MMMM yyyy', { locale: es }).toUpperCase()}
        </h2>
        <Button variant="secondary" size="icon" onClick={onNextMonth} className="uber-button-secondary">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
