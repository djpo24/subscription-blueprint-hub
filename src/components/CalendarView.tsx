
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns';
import { es } from 'date-fns/locale';

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
}

export function CalendarView({ trips, isLoading, onAddPackage }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "in_progress":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "scheduled":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "completed":
        return "Completado";
      case "in_progress":
        return "En Progreso";
      case "scheduled":
        return "Programado";
      case "cancelled":
        return "Cancelado";
      default:
        return status;
    }
  };

  const getTripsForDate = (date: Date) => {
    return trips.filter(trip => 
      isSameDay(new Date(trip.trip_date), date)
    );
  };

  const goToPreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  if (isLoading) {
    return (
      <Card className="uber-card">
        <CardHeader>
          <CardTitle className="text-black">Calendario de Viajes</CardTitle>
          <CardDescription className="text-gray-600">
            Vista de calendario de todos los viajes programados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <div className="text-gray-500">Cargando...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="uber-card">
      <CardHeader>
        <div className="w-full">
          <div className="w-full mb-4">
            <CardTitle className="text-black w-full">Calendario de Viajes</CardTitle>
            <CardDescription className="text-gray-600 w-full">
              Vista de calendario de todos los viajes programados
            </CardDescription>
          </div>
          <div className="flex items-center justify-center gap-3">
            <Button variant="secondary" size="icon" onClick={goToPreviousMonth} className="uber-button-secondary">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-xl font-bold text-black min-w-[200px] text-center">
              {format(currentDate, 'MMMM yyyy', { locale: es }).toUpperCase()}
            </h2>
            <Button variant="secondary" size="icon" onClick={goToNextMonth} className="uber-button-secondary">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-7 gap-2 mb-4">
          {weekDays.map((day, index) => (
            <div 
              key={day} 
              className="p-4 text-center font-bold text-black text-sm bg-gray-100 rounded-lg"
            >
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map((day) => {
            const dayTrips = getTripsForDate(day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isToday = isSameDay(day, new Date());
            
            return (
              <div
                key={day.toISOString()}
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
                  {dayTrips.map((trip) => (
                    <div key={trip.id} className="space-y-2">
                      <div className="bg-gray-100 rounded-xl p-3 border shadow-sm hover:shadow-md transition-all duration-200">
                        <div className="flex items-center justify-between mb-2">
                          <Badge className={`${getStatusColor(trip.status)} text-xs px-2 py-1 font-medium border rounded-full`}>
                            {getStatusLabel(trip.status)}
                          </Badge>
                        </div>
                        
                        <div className="font-bold text-black text-sm mb-2">
                          {trip.origin} → {trip.destination}
                        </div>
                        
                        {trip.flight_number && (
                          <div className="text-gray-600 text-xs mb-2 font-medium">
                            Vuelo: {trip.flight_number}
                          </div>
                        )}
                        
                        <Button
                          size="sm"
                          onClick={() => onAddPackage(trip.id)}
                          className="w-full uber-button-primary text-xs h-8"
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Agregar Encomienda
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
