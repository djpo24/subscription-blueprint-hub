
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
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
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "scheduled":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
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
      <Card>
        <CardHeader>
          <CardTitle>Calendario de Viajes</CardTitle>
          <CardDescription>
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
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Calendario de Viajes</CardTitle>
            <CardDescription>
              Vista de calendario de todos los viajes programados
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-lg font-semibold min-w-[180px] text-center">
              {format(currentDate, 'MMMM yyyy', { locale: es }).toUpperCase()}
            </h2>
            <Button variant="outline" size="icon" onClick={goToNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1">
          {/* Header con días de la semana */}
          {weekDays.map((day, index) => (
            <div 
              key={day} 
              className={`p-3 text-center font-medium text-white text-sm ${
                index === 0 ? 'bg-orange-400' :
                index === 1 ? 'bg-orange-300' :
                index === 2 ? 'bg-yellow-300' :
                index === 3 ? 'bg-green-400' :
                index === 4 ? 'bg-cyan-400' :
                index === 5 ? 'bg-blue-400' :
                'bg-purple-400'
              }`}
            >
              {day}
            </div>
          ))}
          
          {/* Celdas del calendario */}
          {calendarDays.map((day) => {
            const dayTrips = getTripsForDate(day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            
            return (
              <div
                key={day.toISOString()}
                className={`min-h-[120px] border border-gray-200 p-2 ${
                  isCurrentMonth ? 'bg-white' : 'bg-gray-50'
                }`}
              >
                <div className="font-medium text-sm mb-2">
                  {format(day, 'd')}
                </div>
                
                {dayTrips.map((trip) => (
                  <div key={trip.id} className="mb-2">
                    <div className="bg-gray-100 p-2 rounded text-xs border">
                      <div className="flex items-center justify-between mb-1">
                        <Badge className={`${getStatusColor(trip.status)} text-xs px-1 py-0`}>
                          {getStatusLabel(trip.status)}
                        </Badge>
                      </div>
                      
                      <div className="font-medium mb-1">
                        {trip.origin} → {trip.destination}
                      </div>
                      
                      {trip.flight_number && (
                        <div className="text-gray-600 mb-1">
                          Vuelo: {trip.flight_number}
                        </div>
                      )}
                      
                      <Button
                        size="sm"
                        onClick={() => onAddPackage(trip.id)}
                        className="w-full text-xs h-6 mt-1"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Agregar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
